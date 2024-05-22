import { Component, OnInit } from '@angular/core';
import { MoreLessComponent } from '../more-less/more-less.component';
import { DIProduct } from '../../Interfaces/diproduct';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductServiceService } from '../../Services/ProductsSerivce/product-service.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../Services/cart.service';
import { Item } from '../../Interfaces/item';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { AuthComponent } from '../auth/auth.component';
import { AuthService } from '../../Services/Auth/auth.service';

@Component({
  selector: 'app-show-add-to-cart',
  standalone: true,
  imports: [MoreLessComponent, RouterLink, CommonModule],
  templateUrl: './show-add-to-cart.component.html',
  styleUrl: './show-add-to-cart.component.css',
})
export class ShowAddToCartComponent implements OnInit {
  product: DIProduct | null = null;
  item: Item | null = null;
  isLoggedIn: boolean = false;
  GetPrdId: number = 0;
  url = 'http://localhost:5108/';
  constructor(
    private _ActivatedRoute: ActivatedRoute,
    private _ProductServiceService: ProductServiceService,
    private _cartService: CartService,
    private _toastr: ToastrService,
    private router: Router,
    private _AuthService: AuthService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this._AuthService.getisloggedinBehaviorStaus().subscribe((status) => {
      this.isLoggedIn = status;
      console.log('sssssssssssssssssss', status);
    });
    this.GetPrdId = Number(this._ActivatedRoute.snapshot.paramMap.get('id'));
    this._ProductServiceService.getProductByID(this.GetPrdId).subscribe({
      next: (res) => {
        this.product = res.entity;
        console.log('Product is ');
        console.log(this.product);

        //  console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  showsuccess(message: string) {
    this._toastr.success(message, 'Success');
  }
  showerror(message: string) {
    this._toastr.error(message, 'Failed');
  }

  funAdd(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/cart']);
    } else {
      const dialogRef = this.dialog.open(AuthComponent, {
        disableClose: true,
        width: '800px',
      });

      dialogRef.componentInstance.loginSuccess.subscribe(() => {
        console.log('Login successful, creating cart...');
        this.createCart();
      });
    }
  }
  createCart(): void {
    let storedProducts = JSON.parse(
      sessionStorage.getItem('product') || '[]'
    ) as number[];
    let storedQuantities = JSON.parse(
      sessionStorage.getItem('Quantity') || '{}'
    );

    if (Array.isArray(storedProducts) && storedProducts.length > 0) {
      // Check if storedProducts is an array
      console.log('pppppppppppppppppppppppppppppppppppppppppppppppppppppp');
      this._cartService.createCart().subscribe({
        next: (res) => {
          console.log(res.cartId);
          storedProducts.forEach((productId: number) => {
            let quantity = storedQuantities[productId] || 0;
            console.log('mm mm mm mmm mmm mmm mmm mmm mmmm mm mmm');
            this._cartService
              .addtoCart(productId, res.cartId, quantity)
              .subscribe({
                next: (res) => {
                  this.showsuccess('create to cartd');

                  console.log(res + 'cart');
                },
                error: (err) => {
                  console.log(err);
                },
              });
          });

          sessionStorage.removeItem('product');
          sessionStorage.removeItem('Quantity');
          setTimeout(() => {
            this.router.navigate(['/cart']);
          }, 10000);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
