# syntax=docker/dockerfile:1.7
# ── Stage 1: Dependency cache ─────────────────────────────────────────────────
# Pin exact digest for reproducible builds (maven:3.9.9-amazoncorretto-21)
FROM maven:3.9.9-amazoncorretto-21 AS deps

WORKDIR /build

# Copy only pom.xml first — dep layer only invalidates when pom changes
COPY pom.xml .

# BuildKit cache mount keeps ~/.m2 on host; never re-downloads unchanged deps
RUN --mount=type=cache,target=/root/.m2,id=stageway-m2 \
    mvn -q -B -DskipTests dependency:go-offline

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM deps AS build

# Source copied after deps — src-only changes skip the dep download layer
COPY src ./src

RUN --mount=type=cache,target=/root/.m2,id=stageway-m2 \
    mvn -q -B -DskipTests package -Dmaven.test.skip=true

# ── Stage 3: Runtime ──────────────────────────────────────────────────────────
# Minimal JRE-only image — no compiler, no Maven, no shell tools in prod
FROM eclipse-temurin:21-jre-noble AS runtime

WORKDIR /app

# Least-privilege: dedicated non-root user/group
RUN groupadd --system --gid 1001 stageway \
 && useradd  --system --uid 1001 --gid stageway --no-create-home stageway

# Create uploads dir with correct ownership before switching user
RUN mkdir -p /app/uploads && chown -R stageway:stageway /app

# Copy only the fat jar — nothing else from build context
COPY --from=build --chown=stageway:stageway /build/target/backend-0.1.0.jar app.jar

# Container-aware JVM flags:
#   UseContainerSupport   — reads cgroup memory/cpu limits instead of host values
#   MaxRAMPercentage      — caps heap at 75% of container memory
#   ExitOnOutOfMemoryError — crash fast instead of limping on OOM
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+ExitOnOutOfMemoryError \
               -Djava.security.egd=file:/dev/./urandom"

USER stageway

EXPOSE 8081

# exec form avoids shell wrapper — signals (SIGTERM) reach the JVM directly
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
