# Build from repository root:
#   docker build -f policy-service/Dockerfile -t insurance-system/policy-service:1.0.0 .
#
# Multi-stage: JDK + Maven Wrapper only in builder; final image is JRE-only (smaller attack surface).

FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace
COPY pom.xml mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY common ./common
COPY policy-service ./policy-service
COPY payment-service ./payment-service
RUN sed -i 's/\r$//' mvnw \
    && chmod +x mvnw \
    && ./mvnw -B -q -pl policy-service -am package -DskipTests

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
RUN addgroup -S app && adduser -S -G app app
COPY --from=builder --chown=app:app /workspace/policy-service/target/policy-service-*.jar app.jar
USER app
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
