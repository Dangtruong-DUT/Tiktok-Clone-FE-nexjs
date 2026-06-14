<?php

return [
    // Exception class defaults
    'not_found'           => 'Resource not found',
    'forbidden'           => 'Forbidden access',
    'unauthorized'        => 'Unauthorized access',
    'bad_request'         => 'Bad request',
    'conflict'            => 'Conflict error occurred',
    'business'            => 'Business error occurred',
    'jwt'                 => 'JWT error occurred',
    'too_many_requests'   => 'Too many requests. Please try again later.',
    'service_unavailable' => 'Service temporarily unavailable.',
    'internal'            => 'Internal server error',
    'validation'          => 'Validation failed',

    // Domain-specific (thrown from services)
    'post' => [
        'not_found'          => 'Post not found',
        'parent_not_found'   => 'Parent post not found',
        'forbidden_update'   => 'You can only update your own post',
        'forbidden_delete'   => 'You can only delete your own post',
        'parent_required'    => 'Parent ID is required for this post type.',
        'parent_not_allowed' => 'Parent ID is not allowed for this post type.',
        'no_fields'          => 'At least one field must be provided for update',
        'already_liked'      => 'You have already liked this post',
        'not_liked'          => 'You have not liked this post',
        'already_bookmarked' => 'You have already bookmarked this post',
        'not_bookmarked'     => 'You have not bookmarked this post',
        'already_deleted'    => 'Post has already been deleted',
        'not_a_post'         => 'This resource is not a post',
    ],
    'schedule' => [
        'not_found'              => 'Scheduled post not found',
        'not_pending'            => 'Only pending schedules can be cancelled',
        'not_pending_reschedule' => 'Only pending schedules can be rescheduled.',
        'conflict'               => 'Post already has an active schedule',
        'already_published'      => 'Post is already published',
        'forbidden_post'         => 'You do not own this post.',
        'forbidden_schedule'     => 'You do not own this scheduled post.',
        'invalid_status'         => 'Only draft or failed posts can be scheduled.',
        'already_scheduled'      => 'This post is already scheduled. Cancel the existing schedule first.',
        'time_in_future'         => 'Scheduled time must be in the future.',
        'invalid_status_publish' => 'Post cannot be published in its current state.',
    ],
    'video' => [
        'encoding_retry' => 'Encoding can only be retried when status is FAILED',
        'linked_to_post' => 'Cannot delete a video linked to a post',
    ],
    'auth' => [
        'invalid_credentials' => 'Invalid credentials',
        'email_not_verified'  => 'Email not verified',
        'token_expired'       => 'Token has expired',
        'token_invalid'       => 'Token is invalid',
    ],
    'ai' => [
        'copilot_disabled' => 'AI Copilot is currently disabled.',
    ],
];
