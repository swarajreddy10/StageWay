FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app
ENV JAVA_OPTS=""
RUN addgroup --system app && adduser --system --ingroup app app
RUN mkdir -p /app/uploads && chown -R app:app /app
COPY --from=build --chown=app:app /workspace/target/backend-0.1.0.jar /app/app.jar
USER app

EXPOSE 8081
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
