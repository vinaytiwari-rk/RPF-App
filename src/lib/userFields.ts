export // =============================================================================
// CROWDFUNDING CAMPAIGNS ENDPOINTS
// =============================================================================








// =============================================================================
// SOCIAL POSTS ENDPOINTS
// =============================================================================










// =============================================================================
// VOLUNTEERS ENDPOINTS
// =============================================================================








// =============================================================================
// SUBMISSIONS ENDPOINTS
// =============================================================================








// =============================================================================
// USERS ENDPOINTS
// =============================================================================


// SECURITY: previously this had no auth at all and let anyone pass ANY field
// name (including role, points, janSevaCardStatus) for ANY user id — full
// account takeover / privilege escalation. Now it requires login, restricts
// non-admins to editing only their own record, and blocks non-admins from
// touching privileged fields.
const USER_PRIVILEGED_FIELDS = new Set(["role", "points", "janSevaCardStatus", "janSevaCardNo", "isVolunteer", "isDonor"]);
