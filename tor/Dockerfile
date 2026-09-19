FROM alpine:latest
RUN apk add --no-cache tor
EXPOSE 9050
USER tor
CMD ["tor", "-f", "/etc/tor/torrc"]
