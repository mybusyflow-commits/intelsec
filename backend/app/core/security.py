from functools import lru_cache
from clerk_backend_api import Clerk
from app.core.config import settings


@lru_cache()
def get_clerk_client() -> Clerk:
    return Clerk(bearer_auth=settings.CLERK_SECRET_KEY)
