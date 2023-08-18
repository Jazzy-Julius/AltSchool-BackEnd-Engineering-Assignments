const fs = require("fs");
const http = require("http");
const path = require("path");

const itemPath = path.join(__dirname, "items.json");

const PORT = 8008;

function requestHandler(request,  response) {
    if (request.url === "/items" && request.method === "POST"){
        postItem(request,  response);
    }
    if (request.url === "/items" && request.method === "GET") {
        getAllItems(request, response);
    }
    
    if (request.url.startsWith("/items/") && request.method === "GET") {
        getOneItem(request, response);
    }
    
    if (request.url.startsWith("/items/") && request.method === "PATCH") {
        updateItem(request, response);
    }

    if (request.url === ("/items/") && request.method === "DELETE") {
        deleteItem(request, response);
    }
}

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
    console.log(`Server is currently running on http://localhost:${PORT}`);
})


//---------------requestHandler functions------------------
// ##################### TO  POST AN ITEM ###########################

function postItem(request, response) {
    const initRead = fs.readFileSync(itemPath);
    const  itemsObjArray = JSON.parse(initRead);
    const lastId = itemsObjArray[itemsObjArray.length - 1].id
    const newId = lastId + 1

    const body = [];

    request.on ("data", (chunk) => {
        body.push(chunk);
    })

    request.on ("end", () => {
        const parsedBody = Buffer.concat(body).toString();
        const objToPost = JSON.parse(parsedBody);
    

        itemsObjArray.push({
            ...objToPost,
            id:newId 
        });

        fs.writeFile(itemPath, JSON.stringify(itemsObjArray), (err) => {
            if (err) {
                serverError()
            }

            response.end(JSON.stringify(objToPost));
        })
    })

}

//#################### TO GET ALL ITEMS ##################################

function getAllItems(request, response) {
    fs.readFile(itemPath, "utf-8", (error, data) => {
        if (error) {
            serverError();
        }
        response.end(data);
    })
}

//##################### GET ONE ITEM ##################################
function getOneItem(request, response) {
    const id = request.url.split("/")[2];
    const items = fs.readFileSync(itemPath);
    const itemsArrayObj = JSON.parse(items);

    const itemIndex = itemsArrayObj.findIndex((item) => {
        return item.id === parseInt(id);
});
    if (itemIndex === -1) {
        clientError(response)
    }
    response.end(JSON.stringify(itemsArrayObj[itemIndex]));
}

//###################### UPDATE AN ITEM ##############################
function updateItem (request, response) {
    const id = request.url.split("/")[2];
    
    const items = fs.readFileSync(itemPath);
    const itemsObjArray = JSON.parse(items);

    const body = [];
    request.on("data", (chunk) => {
        body.push(chunk);
    })

    request.on("end", () => {
        const parsedBody = Buffer.concat(body).toString();
        const update = JSON.parse(parsedBody);

        const itemIndex = itemsObjArray.findIndex((item) => {
            return item.id === parseInt(id);
        })

        if (itemIndex == -1) {
            clientError(response);
        }
        
        itemsObjArray[itemIndex] = {...itemsObjArray[itemIndex], ...update};

        fs.writeFile(itemPath,JSON.stringify(itemsObjArray), (err) => {
            if (err) {
                serverError(response);
            } else {
                response.writeHead(200);
                response.end(JSON.stringify(itemsObjArray[itemIndex]));
            }
        })
    })
}

//###################### DELETE AN ITEM ######################################

function deleteItem(request, response) {
    const id = request.url.split("/")[2];

    const items = fs.readFileSync(itemPath);
    const itemsArrayObj = JSON.parse(items);

    const itemIndex = itemsArrayObj.findIndex((item) => {
        return item.id === parseInt(id);
    });

    if (itemIndex === -1) {
        clientError(response);
        return; // Return early if the item is not found
    }

    // Remove the item from the array
    const deletedItem = itemsArrayObj.splice(itemIndex, 1)[0];

    // Write the updated data back to the file
    fs.writeFile(itemPath, JSON.stringify(itemsArrayObj), (err) => {
        if (err) {
            serverError(response);
        } else {
            response.writeHead(200);
            response.end(JSON.stringify(deletedItem));
        }
    });
}


function serverError(response) {
    response.writeHead(502);
    response.end("Bad Gateway!");
}

function clientError(response) {
    response.writeHead (404);
    response.end("Item not found!")
}