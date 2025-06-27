# Use the same base image as specified in the docker run command
FROM ghcr.io/public-transport/db-vendo-client

# Set environment variables
ENV USER_AGENT=refundrebel-dev-challenge1
ENV DB_PROFILE=dbnav

# The application inside the container runs on port 3000
# When running the container, map it to a different host port if needed:
# docker run -p 3001:3000 [image-name]
EXPOSE 3000

# The base image's ENTRYPOINT and CMD will be used since we're using the same image
