import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FavoriteService } from '../../Services/Favo/favorite.service';
import { CartService } from '../../Services/cart.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.css',
})
export class FavoriteComponent implements OnInit {
  favorites: any[] = [];
  productId: number = 0;
  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private _toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.getAllFavorites();
  }
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
  addToCart(GetPrdId: number) {
    this.cartService.createCart().subscribe({
      next: (res) => {
        console.log(res.cartId);
        console.log(GetPrdId);
        this.cartService.addtoCart(GetPrdId, res.cartId, 1).subscribe({
          next: (tr) => {
            console.log(tr);
            this.cartService.getItems().subscribe({
              next: (re) => {
                // Update total number of items in the cart
                // You can store this value in a variable and use it wherever needed
                console.log(res);
                console.log(re.cartItems.length);
                this.cartService.updateTotalItems(re.cartItems.length);
                // Log the response for debugging
              },
              error: (er) => {
                console.log(er); // Handle error
              },
            });
            this.showsuccess('add product in cart successfully');
          },
          error: (err) => {
            console.log(err);
            this.showerror('add product in cart faild');
          },
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  removeFavorite(productId: number) {
    let userId = localStorage.getItem('appUserId');
    if (!userId) {
      console.error('userId');
      return;
    }
    this.productId = productId;

    this.favoriteService.deleteFavorite(userId, this.productId).subscribe({
      next: (res) => {
        this.showsuccess('remove Favorite processed successfully');
        this.getAllFavorites();
      },
      error: (err) => {
        console.log(err);
        this.showerror('remove favorite processed falid');
      },
    });
  }

  getAllFavorites() {
    let userId = localStorage.getItem('appUserId');
    if (!userId) {
      console.error('userId');
      return;
    }
    this.favoriteService.getFavoritesByUserId(userId).subscribe({
      next: (res) => {
        this.favorites = res;
        console.log(this.favorites);
        this.favoriteService.updatetotalFav(this.favorites.length);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  trackById(index: number, product: any): any {
    return product.id;
  }
}
