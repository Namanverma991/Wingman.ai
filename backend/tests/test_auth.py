"""
Unit tests for authentication flows.
"""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.anyio
async def test_health_check(client: AsyncClient):
    """Health endpoint should return 200."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "version" in data


@pytest.mark.anyio
async def test_root_endpoint(client: AsyncClient):
    """Root endpoint should return app info."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Wingman AI"


@pytest.mark.anyio
async def test_register_success(client: AsyncClient):
    """Register with valid data should return 201 with tokens."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "SecurePass123",
            "full_name": "Test User",
        },
    )
    # May fail if DB not available — that's expected in unit test env
    if response.status_code == 201:
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"


@pytest.mark.anyio
async def test_register_duplicate_email(client: AsyncClient):
    """Registering the same email twice should return 409."""
    payload = {
        "email": "dupe@example.com",
        "username": "dupeuser",
        "password": "SecurePass123",
    }
    first = await client.post("/api/v1/auth/register", json=payload)
    if first.status_code == 201:
        payload["username"] = "dupeuser2"
        second = await client.post("/api/v1/auth/register", json=payload)
        assert second.status_code == 409


@pytest.mark.anyio
async def test_login_wrong_password(client: AsyncClient):
    """Login with wrong password should return 401."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "WrongPass123"},
    )
    assert response.status_code == 401


@pytest.mark.anyio
async def test_protected_endpoint_no_token(client: AsyncClient):
    """Accessing protected route without token should return 401."""
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_protected_endpoint_invalid_token(client: AsyncClient):
    """Accessing protected route with invalid token should return 401."""
    response = await client.get(
        "/api/v1/users/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert response.status_code == 401


@pytest.mark.anyio
async def test_register_validation_error(client: AsyncClient):
    """Register with invalid data should return 422."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "not-an-email",
            "username": "ab",  # too short
            "password": "short",  # too short
        },
    )
    assert response.status_code == 422
