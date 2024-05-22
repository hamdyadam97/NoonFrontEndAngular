import { Component, OnInit, Renderer2, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MoreLessComponent } from '../more-less/more-less.component';
import { ShowAddToCartComponent } from '../show-add-to-cart/show-add-to-cart.component';
import { CommonModule } from '@angular/common';
import { ProductServiceService } from '../../Services/ProductsSerivce/product-service.service';
import { DIProduct } from '../../Interfaces/diproduct';
import { CartService } from '../../Services/cart.service';
import { AuthService } from '../../Services/Auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../Services/trans/translation.service';
import { Subscription } from 'rxjs';
import { Iproduct } from '../../Interfaces/iproduct';
import { ToastrService } from 'ngx-toastr';
import { RateService } from '../../Services/Rate/rate.service';
import { Rate } from '../../Interfaces/rate';
import { CountRate } from '../../Interfaces/product-brand';

@Component({
  selector: 'app-details-product',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MoreLessComponent,
    ShowAddToCartComponent,
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './details-product.component.html',
  styleUrl: './details-product.component.css',
})
export class DetailsProductComponent implements OnInit {
  GetPrdId: number = 0;
  category: string = '';
  countRate: CountRate = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  } as CountRate;
  product: DIProduct | null = null;
  isLoggedIn: boolean = false;
  currentNumber: number = 1;
  filterproducts: Iproduct[] = [];
  rates: Rate[] = [];
  currentUserID: string;
  averageDegreeRate: number = 0;
  rate: Rate = {
    id: 0,
    type: 0,
    comment: '',
    degreeRate: 0,
    userId: localStorage.getItem('appUserId') || '', // You may set this value based on your authentication logic
    productId: 0, // You may set this value based on the product being rated
  };
  url = 'http://localhost:5108/'; //MVC Image URL
  language: string = 'ar';
  languageChangeSubscription: Subscription | undefined;
  constructor(
    private _productServiceService: ProductServiceService,
    private _ActivatedRoute: ActivatedRoute,
    private _cartService: CartService,
    private _AuthService: AuthService,
    private _TranslationService: TranslationService,
    private renderer: Renderer2,
    private _toastr: ToastrService,
    private _rateService: RateService
  ) {
    this.currentUserID = localStorage.getItem('appUserId') || '';
  }

  translate = inject(TranslateService);
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
  ngOnInit(): void {
    this.GetPrdId = Number(this._ActivatedRoute.snapshot.paramMap.get('id'));
    this.rate.productId = this.GetPrdId;
    this._AuthService.getisloggedinBehaviorStaus().subscribe((status) => {
      this.isLoggedIn = status;
      console.log('sssssssssssssssssss', status);
    });

    this._rateService.getRatesProduct(this.GetPrdId).subscribe({
      next: (res) => {
        this.rates = res.rates;
        let averageDegreeRate = res.averageDegreeRate;
        let roundedDegreeRate = Math.ceil(averageDegreeRate);

        // Ensure the rounded degree rate is between 1 and 5
        if (roundedDegreeRate < 1) {
          roundedDegreeRate = 1;
        } else if (roundedDegreeRate > 5) {
          roundedDegreeRate = 5;
        }

        this.averageDegreeRate = roundedDegreeRate;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.countratefuv();
    this._productServiceService.getProductByID(this.GetPrdId).subscribe({
      next: (res) => {
        this.product = res.entity;
        this.category = res.entity.category;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });

    this._productServiceService
      .getAllFilteredProduct(1, this.category)
      .subscribe({
        next: (res) => {
          this.filterproducts = res.entities;

          console.log(res);
        },
        error: (err) => {},
      });
    this.language = this._TranslationService.getDefaultLang()?.[0] || 'ar';

    /////////////////////////////////////////////////////////////////////
    //listening for any language change happen
    this.languageChangeSubscription =
      this._TranslationService.translateService.onLangChange.subscribe(
        (event: any) => {
          this.language = event.lang || 'ar';
        }
      );
  }

  incrementNumber(): void {
    this.currentNumber++;
  }
  reductionNumber(): void {
    if (this.currentNumber > 0) {
      this.currentNumber--;
    }
  }
  rategit(): void {
    this._rateService.getRatesProduct(this.GetPrdId).subscribe({
      next: (res) => {
        this.rates = res.rates;
        let averageDegreeRate = res.averageDegreeRate;
        let roundedDegreeRate = Math.ceil(averageDegreeRate);

        // Ensure the rounded degree rate is between 1 and 5
        if (roundedDegreeRate < 1) {
          roundedDegreeRate = 1;
        } else if (roundedDegreeRate > 5) {
          roundedDegreeRate = 5;
        }

        this.averageDegreeRate = roundedDegreeRate;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  createCart(): void {
    if (this.isLoggedIn) {
      console.log('session');

      let storedProducts = JSON.parse(
        sessionStorage.getItem('product') || '[]'
      ) as number[]; // Ensure storedProducts is initialized as an array
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
                    console.log(res + 'cart');
                  },
                  error: (err) => {
                    console.log(err);
                  },
                });
            });

            sessionStorage.removeItem('product');
            sessionStorage.removeItem('Quantity');
          },
          error: (err) => {
            console.log(err);
          },
        });
      } else {
        this._cartService.createCart().subscribe({
          next: (res) => {
            console.log(res.cartId);
            console.log(this.GetPrdId);
            this._cartService
              .addtoCart(this.GetPrdId, res.cartId, this.currentNumber)
              .subscribe({
                next: (tr) => {
                  console.log(tr, 'add product in cart ');
                  this.showsuccess('add product in cart successfully');
                  this._cartService.getItems().subscribe({
                    next: (re) => {
                      // Update total number of items in the cart
                      // You can store this value in a variable and use it wherever needed
                      console.log(res);
                      console.log(re.cartItems.length);
                      this._cartService.updateTotalItems(re.cartItems.length);
                      // Log the response for debugging
                    },
                    error: (er) => {
                      console.log(er); // Handle error
                    },
                  });
                },
                error: (err) => {
                  console.log(err);
                  this.showerror('add product in cart failed');
                },
              });
          },
          error: (err) => {
            console.log(err);
          },
        });
      }
    } else {
      console.log('logout session');
      let storedProducts = JSON.parse(
        sessionStorage.getItem('product') || '[]'
      ) as number[]; // Ensure storedProducts is initialized as an array
      let storedQuantities = JSON.parse(
        sessionStorage.getItem('Quantity') || '{}'
      );
      storedProducts.push(this.GetPrdId);
      storedQuantities[this.GetPrdId] = this.currentNumber;
      sessionStorage.setItem('product', JSON.stringify(storedProducts));
      sessionStorage.setItem('Quantity', JSON.stringify(storedQuantities));
    }
  }

  w3_open() {
    console.log('open');
    const sidebar = document.getElementById('mySidebar');
    if (sidebar) {
      sidebar.style.display = 'block';
      console.log('jjjjjjjj');
    }
  }

  w3_close() {
    const sidebar = this.renderer.selectRootElement('#mySidebar');
    this.renderer.setStyle(sidebar, 'display', 'none');
  }

  bigImageUrl: string = '';

  showBigImage(imageUrl: string) {
    this.bigImageUrl = imageUrl;
  }

  addToCartVisible: boolean = false;
  NooNElement: boolean = true;

  toggleAddToCart() {
    this.addToCartVisible = !this.addToCartVisible;
  }
  NoonSt() {
    this.NooNElement = !this.NooNElement;
  }

  addRateProduct() {
    // Assuming you have a function GetPrdId that fetches the product ID
    this._rateService.postRateProduct(this.rate, this.GetPrdId).subscribe({
      next: (res) => {
        console.log('Rate added successfully');
        this.rategit();
        // Optionally, you can reset the form or show a success message here
      },
      error: (err) => {
        console.error('Failed to add rate', err);
        // Optionally, you can show an error message here
      },
    });
  }

  updateRateProduct(rate: Rate) {
    rate.productId = this.GetPrdId;

    this._rateService.updateRateProduct(rate).subscribe({
      next: (res) => {
        this.showsuccess('RATE  updated');
      },
      error: (err) => {
        console.log(err);
        this.showerror('RATE  not updated');
      },
    });
  }
  deleteRateProduct(id: number) {
    this._rateService.deleteRateProduct(id).subscribe({
      next: (res) => {
        console.log(res);
        this.showsuccess('delete rate successfully');
        this.rategit();
      },

      error: (err) => {
        this.showerror('delete rate');
        console.log(err);
      },
    });
  }
  countratefuv() {
    this._rateService.countRate(this.GetPrdId).subscribe({
      next: (res) => {
        console.log(res);
        this.countRate = res;
      },

      error: (err) => {
        console.log(err);
      },
    });
  }
}
