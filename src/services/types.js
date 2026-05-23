/**
 * Kontrak data FE — selaraskan dengan response backend.
 * @module services/types
 */

/**
 * @typedef {'Masyarakat' | 'Admin' | 'Super Admin'} UserRole
 */

/**
 * @typedef {'ACTIVE' | 'INACTIVE' | 'SUSPENDED'} AccountStatus
 */

/**
 * @typedef {Object} AppUser
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {UserRole} role
 * @property {string} [nik]
 * @property {AccountStatus} [status]
 * @property {boolean} [email_verified]
 * @property {string} [email_verified_at]
 * @property {string[]} [permissions]
 * @property {string} [created_at]
 * @property {string} [deleted_at]
 */

/**
 * @typedef {Object} Complaint
 * @property {string} id
 * @property {string} ticket_number
 * @property {string} user_id
 * @property {string} user_name
 * @property {string} title
 * @property {string} description
 * @property {string} category_id
 * @property {string} status
 * @property {string} priority
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} address
 * @property {string} created_at
 * @property {string[]} [photos]
 * @property {string[]} [evidence_after_photos]
 * @property {string} [resolution_note]
 * @property {string|null} [resolved_at]
 */

/**
 * @typedef {Object} ApiSuccess
 * @property {true} success
 * @property {string} [message]
 * @property {*} [data]
 */

/**
 * @typedef {Object} ApiFailure
 * @property {false} success
 * @property {string} message
 * @property {Record<string, string[]>} [errors]
 * @property {boolean} [needsEmailVerification]
 */

/** @typedef {ApiSuccess | ApiFailure} ApiResult */

/**
 * Payload buat laporan — photos bisa URL (mock) atau File (API).
 * @typedef {Object} CreateComplaintPayload
 * @property {string} title
 * @property {string} description
 * @property {string} categoryId
 * @property {string} [priority]
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} address
 * @property {(string|File|Blob)[]} [photos]
 */

export {};
