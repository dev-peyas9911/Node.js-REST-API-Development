import type { IncomingMessage, ServerResponse } from "http";
import { insertProduct, readProduct } from "../service/product.service";
import type { IProduct } from "../types/product.type";
import { parseBody } from "../utility/parseBody";
import { sendResponse } from "../utility/sendResponse";

export const productController = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  //   console.log(req);
  const products = readProduct();
  //   console.log(products);
  const url = req.url;
  const method = req.method;

  const urlPart = url?.split("/");
  const id = urlPart && urlPart[1] === "products" ? Number(urlPart[2]) : null;
  //   console.log(id)

  if (url === "/products" && method === "GET") {
    // res.writeHead(200, { "content-type": "application/json" });
    // res.end(
    //   JSON.stringify({
    //     message: "Product retrive successfully",
    //     data: { products },
    //   }),
    // );
    try {
      return  sendResponse(res, true, 200, "Product retrive successfully", products)
    } catch (error) {
      return  sendResponse(res, false, 500, "Something went wrong", error);
    }
    
  } else if (method === "GET" && id !== null) {
    const products = readProduct();
    const product = products.find((p: IProduct) => p.id === id);
    if (!product) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Product not found",
          data: null,
        }),
      );
      return;
    }
    // console.log(product);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Product retrive successfully",
        data: { product },
      }),
    );
  } else if (method === "POST" && url === "/products") {
    const body = await parseBody(req);
    const products = readProduct();
    // console.log(body)
    const newProduct = {
      id: Date.now(),
      ...body,
    };
    products.push(newProduct);
    insertProduct(products);
    // console.log(products);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Product created successfully",
        data: newProduct,
      }),
    );
  } else if (method === "PUT" && id !== null) {
    const body = await parseBody(req);
    const products = readProduct();

    const index = products.findIndex((p: IProduct) => p.id === id);
    // console.log(index);
    if (index < 0) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Product not found",
          data: null,
        }),
      );
    }
    products[index] = {
      id: products[index].id,
      ...body,
    };
    insertProduct(products);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Product updated successfully",
        data: products[index],
      }),
    );
  } else if (method === "DELETE" && id !== null) {
    const products = readProduct();
    const index = products.findIndex((p: IProduct) => p.id === id);
    if (index < 0) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Product not found",
          data: null,
        }),
      );
    }

    products.splice(index, 1);
    insertProduct(products);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Product deleted successfully",
        data: null,
      }),
    );
  }
};
