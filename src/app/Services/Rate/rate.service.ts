import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rate } from '../../Interfaces/rate';

@Injectable({
  providedIn: 'root',
})
export class RateService {
  private apiUrl = environment.ApiUrl;
  constructor(private _http: HttpClient) {}
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    }),
  };

  getRatesProduct(productId: number): Observable<any> {
    return this._http.get<any>(
      `${this.apiUrl}/getAllRatesForProduct/${productId}`
    );
  }

  deleteRateProduct(RateId: number): Observable<any> {
    return this._http.delete<any>(
      `${this.apiUrl}/deleteRate/${RateId}`,
      this.httpOptions
    );
  }

  updateRateProduct(rate: Rate): Observable<Rate> {
    console.log(rate, 'retetttttttttttttttttttttttttttttttttttt');

    return this._http.put<any>(
      `${this.apiUrl}/updateRate/${rate.id}`,
      JSON.stringify({
        type: rate.type,
        comment: rate.comment,
        degreeRate: rate.degreeRate,
      }),
      this.httpOptions
    );
  }


  countRate(productId: number): Observable<any> {
    

    return this._http.get<any>(
      `${this.apiUrl}/updateRate/${productId}`,
      
      this.httpOptions
    );
  }
  postRateProduct(rate: Rate,prod:number): Observable<any> {
    console.log(rate, 'retetttttttttttttttttttttttttttttttttttt');

    return this._http.post<any>(
      `${this.apiUrl}/addRate`,
      JSON.stringify({
        type: rate.type,
        comment: rate.comment,
        degreeRate: rate.degreeRate,
        userId: rate.userId,
        productId: prod,
      }),
      this.httpOptions
    );
  }
}
