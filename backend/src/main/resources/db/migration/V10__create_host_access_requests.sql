CREATE TABLE host_access_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX idx_host_access_requests_user_id ON host_access_requests(user_id);
CREATE INDEX idx_host_access_requests_status ON host_access_requests(status);
CREATE UNIQUE INDEX ux_host_access_requests_pending ON host_access_requests(user_id)
    WHERE status = 'PENDING';
