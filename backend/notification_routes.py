"""
Notification Routes for GJC Platform
API endpoints for managing user notifications
"""
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime, timezone
from typing import Optional

from auth_routes import get_current_user
from notification_service import (
    get_user_notifications,
    mark_notification_read,
    mark_all_notifications_read,
    get_unread_count,
    set_database as set_notification_db
)

# Database will be injected
db = None

def set_database(database):
    global db
    db = database
    set_notification_db(database)

notification_router = APIRouter(prefix="/notifications", tags=["Notifications"])

@notification_router.get("")
async def list_notifications(
    request: Request,
    unread_only: bool = False,
    limit: int = 50
):
    """Get user's notifications"""
    user = await get_current_user(request)
    
    notifications = await get_user_notifications(
        user_id=user["user_id"],
        unread_only=unread_only,
        limit=limit
    )
    
    unread_count = await get_unread_count(user["user_id"])
    
    return {
        "notifications": notifications,
        "unread_count": unread_count,
        "total": len(notifications)
    }

@notification_router.get("/unread-count")
async def get_notification_count(request: Request):
    """Get count of unread notifications (for badge)"""
    user = await get_current_user(request)
    count = await get_unread_count(user["user_id"])
    return {"unread_count": count}

@notification_router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, request: Request):
    """Mark a specific notification as read"""
    user = await get_current_user(request)
    
    success = await mark_notification_read(notification_id, user["user_id"])
    
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}

@notification_router.put("/read-all")
async def mark_all_read(request: Request):
    """Mark all notifications as read"""
    user = await get_current_user(request)
    
    count = await mark_all_notifications_read(user["user_id"])
    
    return {"message": f"Marked {count} notifications as read"}

@notification_router.delete("/{notification_id}")
async def delete_notification(notification_id: str, request: Request):
    """Delete a notification"""
    user = await get_current_user(request)
    
    result = await db.notifications.delete_one({
        "notification_id": notification_id,
        "user_id": user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification deleted"}

@notification_router.delete("")
async def clear_all_notifications(request: Request):
    """Delete all notifications for user"""
    user = await get_current_user(request)
    
    result = await db.notifications.delete_many({"user_id": user["user_id"]})
    
    return {"message": f"Deleted {result.deleted_count} notifications"}
