
export type ProductInput = {
  availableColors: [String];
  brand: String;
  dateAdded: Number;
  description: String;
  id: String;
  image: String;
  imageCollections: [
    {
      id: String;
      url: String;
    }
  ];
  isFeatured: Boolean;
  isRecommended: Boolean;
  maxQuantity: Number;
  name: String;
  price: Number;
  keywords: [String];
  quantity: Number;
  name_lower: String;
  sizes: [String];
};

export type OrderInput = {
  authId: String;
  orderId: String;
  subtotal: Number;
  time: Number;
  date: Number;
  item: {
    brand: String;
    id: String;
    name: String;
    quantity: Number;
    selectedSize: String;
  };
  checkout: {
    address: String;
    email: String;
    fullname: String;
    isDone: Boolean;
    isInternational: Boolean;
    mobile: {
      country: String;
      countryCode: String;
      dialCode: String;
      value: String;
    };
  };
};
