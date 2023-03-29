import { Component, ViewChild, ElementRef,OnInit } from '@angular/core';
import { Platform,NavController } from '@ionic/angular';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';



declare var google:any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('map', { static: true })
  // @ViewChild('map')
  mapElement!: ElementRef 
  map: any;
  currentMapTrack = null;
 
  isTracking = false;
  trackedRoute = [];
  previousTracks = [];
  positionSubscription: Subscription | any;
  driver_current_city: any;
 

  constructor(public navCtrl: NavController, private plt: Platform, private geolocation: Geolocation, ) {}
  ngOnInit(){
    setTimeout(() => {
      this.loadMap(23.57,87.65);
    }, 500);
  }

  // ngOnInit() {
  //   setTimeout(() => {
  //     this.plt.ready().then(()=>{

  //       let mapOptions = {
  //         zoom: 13,
  //         mapTypeId: google.maps.MapTypeId.ROADMAP,
  //         mapTypeControl: false,
  //         streetViewControl: false,
  //         fullscreenControl: false
  //       }
  //       this.map = new google.maps.Map(this.mapElement.nativeElement,mapOptions);
  //       this.geolocation.getCurrentPosition().then(pos=>{
  //         console.log("pos",pos);  
  //         let latLng = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
  //         this.map.setCenter(latLng);
  //         this.map.setZoom(16);
  //       }).catch((error)=>{
  //         console.log('Error getting location', error);
  //       })
  //     })
  //   }, 5000);
   
  // }

loadMap(latOri: number, lngOri:  number) {
    let base = this;
    base.get_current_position().then((success: any) => {
      console.log(success);
      var latlng = new google.maps.LatLng(success.latitude, success.longitude);
      base.getCity(latlng).then((res: any) => {
        base.driver_current_city = res.city;
        console.log("latitude " + success.latitude);
        console.log("latitude " + success.longitude);
        var locationInfowindow = new google.maps.InfoWindow({
          content: res.address,
        });
        base.map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: success.latitude, lng: success.longitude },
          scrollwheel: false,
          zoom: 14,
          fullscreenControl: false,
          mapTypeControl: false,
          zoomControl: true,
          mapTypeId: 'terrain',
          infowindow: locationInfowindow
        });
        var marker = new google.maps.Marker({
          map: base.map,
          position: { lat: success.latitude, lng: success.longitude },
          icon: { url: 'assets/pin1.gif', scaledSize: new google.maps.Size(45, 45) }
        });
        google.maps.event.addListener(marker, 'click', () => {
          if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
          }
          locationInfowindow.open(base.map, this);
        });
      })
    }, function (error: any) {
      console.log('Location Error', error);
    });
  }
  get_current_position() {
    let base = this;
    return new Promise(function (resolve, reject) {
      let options = {
        enableHighAccuracy: true
      };
      base.geolocation.getCurrentPosition(options).then((resp) => {
        resolve({
          latitude: resp.coords.latitude,
          longitude: resp.coords.longitude,
          heading: resp.coords.heading,
          accuracy: resp.coords.accuracy
        });
      }).catch((error) => {
        reject(error);
      });
    });
  }
  getCity(latlng:any) {
    return new Promise(resolve => {
      let base = this;
      var geocoder:any = geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'latLng': latlng }, function (results:any, status:any) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            console.log(results[0]);
            console.log(results[0].formatted_address);
            for (var i = 0; i < results[0].address_components.length; i++) {
              if (results[0].address_components[i].types[0] == 'locality') {
                console.log((results[0].address_components[i].long_name).toLowerCase());
                break;
              }
            }
            resolve({
              city: (results[0].address_components[i].long_name).toLowerCase(),
              address: results[0].formatted_address
            })
          }
        }
      });
    })
  }
 


}
