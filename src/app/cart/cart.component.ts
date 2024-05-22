import { Component, OnInit, inject } from '@angular/core';
import { CartService } from '../Services/cart.service';
import { Item } from '../Interfaces/item';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiOrderService } from '../Services/Order/api-order.service';
import { IOrder } from '../Interfaces/Order/iorder';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cart: Item = {} as Item;
  url = 'http://localhost:5108/';
  order: IOrder = {} as IOrder;
  selectedQuantities: { [key: string]: number } = {};
  selectedQty: number = 1;
  qu: number[] = [];
  currentNumber: number = 1;
  translate = inject(TranslateService);
  constructor(
    private _cartService: CartService,
    private router: Router,
    private _orderService: ApiOrderService,
    private _toastr: ToastrService
  ) {}
  showsuccess(message: string) {
    this._toastr.success(message, 'Success');
  }
  showerror(message: string) {
    this._toastr.error(message, 'Failed');
  }
  showwarning(message: string) {
    this._toastr.warning(message, 'Warning');
  }
  showinfo(message: string) {
    this._toastr.info(message, 'Info');
  }
  RemoveFromCart(CartItemId: number) {
    this._cartService.DeleteFromCart(CartItemId).subscribe({
      next: (res) => {
        console.log(res);
        this.showsuccess('delete product in cart successfully');
        this._cartService.getItems().subscribe({
          next: (re) => {
            this.cart = re;
            this._cartService.updateTotalItems(re.cartItems.length);
            console.log(re);
          },
          error: (error) => {
            console.log(error);
            this.showerror('delete product in cart faild');
          },
        });
      },
    });
  }
  getQuantityOptions(cartItem: any): number[] {
    this.qu = Array.from(
      { length: this.cart.product.quantity },
      (_, i) => i + 1
    );

    return cartItem.availableQuantities;
  }

  updateQuantity(selectedQty: number, cartItem: any) {
    this.selectedQty = selectedQty;
    if (this.selectedQuantities[cartItem.product.id] != null) {
      this.cart.totalAmount =
        this.cart.totalAmount -
        this.selectedQuantities[cartItem.product.id] * cartItem.productPrice;
    }
    if (this.cart.totalAmount < 0) {
      this.cart.totalAmount = 0;
    }
    this.selectedQuantities[cartItem.product.id] = selectedQty;

    if (selectedQty > 1) {
      this.cart.totalAmount += (selectedQty - 1) * cartItem.productPrice;
    } else {
      this.cart.totalAmount += selectedQty * cartItem.productPrice;
    }

    if (selectedQty == 1) {
      this.cart.totalAmount = cartItem.productPrice;
    }
  }
  // incrementNumber(): void {
  //   this.currentNumber++;
  // }
  // reductionNumber(): void {
  //   if (this.currentNumber > 0) {
  //     this.currentNumber--;
  //   }
  // }

  // Inside your component class
  incrementNumber(cartItem: any): void {
    var price = cartItem.productPrice * cartItem.quantity;
    cartItem.quantity++;
    this.cart.totalAmount += cartItem.quantity * cartItem.productPrice - price;
  }

  reductionNumber(cartItem: any): void {
    if (cartItem.quantity > 0) {
      // var price  = cartItem.productPrice*cartItem.quantity
      cartItem.quantity--;
      this.cart.totalAmount -= cartItem.productPrice;
    }
  }

  createCart(
    cartItemsWithQuantity: { cartItem: any; quantity: number }[]
  ): void {
    // First, create a new cart
    this._cartService.createCart().subscribe({
      next: (res) => {
        console.log('Cart created with ID:', res.cartId);

        // Now, add each cart item with its quantity to the newly created cart
        cartItemsWithQuantity.forEach((itemWithQuantity) => {
          const cartItem = itemWithQuantity.cartItem;
          const quantity = itemWithQuantity.quantity;
          console.log(
            quantity,
            'ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss'
          );
          // Call the addtoCart service method to add the item to the cart
          this._cartService
            .addtoCart(cartItem.productId, res.cartId, quantity)
            .subscribe({
              next: (tr) => {
                console.log(
                  'Item added to cart:',
                  cartItem.productName,
                  'Quantity:',
                  quantity
                );
                this.showsuccess('Item added to cart successfully quetitty');
              },
              error: (err) => {
                console.error('Error adding item to cart:', err);
              },
            });
        });

        // Optionally, you can perform additional actions after adding all items to the cart
        this.showsuccess('Cart created successfully with updated quantities.');
      },
      error: (err) => {
        console.error('Error creating cart:', err);
        this.showerror('Failed to create cart.');
      },
    });
  }

  getQuantityList(quantity: number): number[] {
    return Array.from({ length: quantity }, (_, i) => i + 1);
  }
  ngOnInit(): void {
    console.log(this.cart);
    this._cartService.getItems().subscribe({
      next: (res) => {
        this.cart = res;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  goToCheckout(): void {
    console.log(this.cart.cartId, 'dsaaaaaaaaaaaaaaaaa');

    const cartItemsWithUpdatedQuantities = this.cart.cartItems.map(
      (cartItem) => {
        return {
          cartItem: cartItem,
          quantity: cartItem.quantity,
        };
      }
    );

    // Call 
    
    this.createCart(cartItemsWithUpdatedQuantities);
    console.log('created');
    this._cartService.getItems().subscribe({
      next: (res) => {
        this.cart = res;
        this._cartService.updateTotalItems(0);
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.order.cartId = this.cart.cartId;
    this.order.deliveryMethodId = 1;
    this.order.transactions = ['checkout'];
    this.order.subtotal = this.cart.totalAmount;
    this._orderService.checkOrder(this.order).subscribe({
      next: (res) => {
        console.log(res);
        this._cartService.getItems().subscribe({
          next: (re) => {
            this.cart = re;
            // console.log(re.cartItems.length,'sssssssssssssssssssssssssssssssssss');
            this._cartService.updateTotalItems(0);
            console.log(res);
          },
          error: (er) => {
            console.log(er);
          },
        });
        this.router.navigate(['/order']);
      },
      error: (err) => {
        console.log(err);
        // this.router.navigate(['/order']);
      },
    });
  }
}
