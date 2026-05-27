# syntax=docker/dockerfile:1.7

FROM maven:3.9.9-amazoncorretto-21 AS deps
WORKDIR /build

# Keep dependency downloads in a stable cached layer.
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2,id=stageway-m2 \
    mvn -q -B -DskipTests dependency:go-offline

FROM deps AS build
COPY src ./src
RUN --mount=type=cache,target=/root/.m2,id=stageway-m2 \
    mvn -q -B -DskipTests package -Dmaven.test.skip=true

FROM build AS extract
RUN JAR_FILE="$(find /build/target -maxdepth 1 -name '*.jar' ! -name '*.original' | head -n 1)" \
 && test -n "${JAR_FILE}" \
 && mkdir -p /build/target/extracted \
 && cd /build/target/extracted \
 && java -Djarmode=layertools -jar "${JAR_FILE}" extract

FROM eclipse-temurin:21-jre-noble AS runtime
WORKDIR /app

RUN groupadd --system --gid 1001 stageway \
 && useradd --system --uid 1001 --gid stageway --no-create-home stageway \
 && mkdir -p /app/uploads \
 && chown -R stageway:stageway /app

# Copy layered Spring Boot content for smaller and cache-friendly image updates.
COPY --from=extract --chown=stageway:stageway /build/target/extracted/dependencies/ ./
COPY --from=extract --chown=stageway:stageway /build/target/extracted/spring-boot-loader/ ./
COPY --from=extract --chown=stageway:stageway /build/target/extracted/snapshot-dependencies/ ./
COPY --from=extract --chown=stageway:stageway /build/target/extracted/application/ ./

ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70.0 \
 -XX:InitialRAMPercentage=10.0 \
 -XX:+ExitOnOutOfMemoryError \
 -Djava.security.egd=file:/dev/./urandom"

USER stageway

EXPOSE 8081

# Direct exec entrypoint ensures Render SIGTERM reaches the JVM process.
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
