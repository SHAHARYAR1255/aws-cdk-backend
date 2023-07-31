// import addTodo from "./addTodo";
// import addTodo from './addTodo';
// import deleteTodo from './deleteTodo';
// import getProducts from "./getProducts";
// import updateTodo from './updateTodo';
import addOrder, { getOrders } from "./order";

import { OrderInput } from "./Product";

type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    // todoId: string;
    // todo: Todo,
    order: OrderInput;
  };
};

exports.handler = async (event: AppSyncEvent) => {
  switch (event.info.fieldName) {
    case "addTodo":
    //   return await addTodo(event.arguments.todo);
    case "getTodos":
    // return await getProducts();
    case "deleteTodo":
    // return await deleteTodo(event.arguments.todoId);
    case "updateTodo":

    // return await updateTodo(event.arguments.todo);
    case "addOrder":
      return await addOrder(event.arguments.order);
    case "getOrders":
      return await getOrders();
    default:
      return null;
  }
};
