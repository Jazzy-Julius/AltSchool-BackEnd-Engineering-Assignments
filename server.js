const path = require("path");
const http = require("http");
const fs = require("fs");
const PORT = 4005;

const rightPath = path.join(__dirname, "index.html");
const errorPath = path.join(__dirname, "error.html");


function requestHandler (request, response) {
    if (request.url === "/") {
        getPage(request, response);
    }

    if (request.url.endsWith(".html") && request.method === "GET") {
        try {
            getPageQueried(request, response);
        } catch (error) {
            errorPage(request,  response);
        }
    }
}

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
    console.log(`Server is currently running on http://localhost:${PORT}`);
})



function getPage(request, response) {
    response.setHeader ("content-type", "text/html");
    response.writeHead(200);
    response.end(fs.readFileSync(rightPath));
}

function errorPage(request, response) {
    response.setHeader("content-type", "text/html");
    response.writeHead(404);
    response.end(fs.readFileSync(errorPath));
   
}

function getPageQueried(request, response) {
    const file = request.url.split("/")[1];
    const webPath = path.join(__dirname, file);
    const renderWeb = fs.readFileSync(webPath);
    response.setHeader("content-type", "text/html");
    response.writeHead(200);
    response.end(renderWeb);
}