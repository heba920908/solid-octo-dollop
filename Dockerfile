FROM fedora:latest

RUN dnf install -y golang git curl tar node
RUN curl -L https://github.com/gohugoio/hugo/releases/download/v0.150.0/hugo_extended_0.150.0_linux-amd64.tar.gz | tar -C /usr/local/bin/ -xzvf - hugo

RUN mkdir /site
WORKDIR /site
EXPOSE 1313

CMD ["hugo", "server", "-D", "--bind", "0.0.0.0"]
