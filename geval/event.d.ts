declare module "geval/event" {
  type Handler<DataType> = (data: DataType) => unknown;
  type Unlisten = () => void;
  type Listen<DataType> = (handler: Handler<DataType>) => Unlisten;
  type Broadcast<DataType> = (data: DataType) => void;
  type EventInstance<DataType> = {
    listen: Listen<DataType>;
    broadcast: Broadcast<DataType>;
  };
  declare function Event<DataType>(): EventInstance<DataType>;

  export = Event;
}
