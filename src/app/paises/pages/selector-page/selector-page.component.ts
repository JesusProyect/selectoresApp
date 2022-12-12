import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaisesService } from '../../services/paises.service';
import { Pais, PaisSmall } from '../../interfaces/paises.interface';
import { switchMap, tap, of, delay } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  miFormulario: FormGroup = this.fb.group({
    region: ['' , [ Validators.required ]], //o continente
    pais: ['' , [Validators.required ] ],
    frontera: ['', [ Validators.required ]  ]
  })

  //llenar selectores
  regiones : string[]    = [];
  paises   : PaisSmall[] = [];
  fronteras: PaisSmall[] = [];
  //fronteras: string[]    = [];
  //fronteras: string[] = []  MI SOLUCION ;

  //UI
  cargando: boolean = false;

  constructor( private fb: FormBuilder,
               private paisesService: PaisesService  ) { }

  ngOnInit(): void {

    this.regiones = this.paisesService.regiones;
    this.miFormulario.get('pais')?.disable();
    this.miFormulario.get('frontera')?.disable();

    //cuando cambie la region
    this.miFormulario.get('region')?.valueChanges
    .pipe(
        tap( ( _ )  => {
           this.miFormulario.get('pais')?.reset('') ;
           this.cargando = true;
      }),
        switchMap( region => this.paisesService.getPaisesPorRegion( region ) )
    )  
    .subscribe( paises => {
            this.cargando = false;
            this.miFormulario.get('pais')?.enable();
            this.paises = paises;

          } );


      // cuando cambia el pais
        this.miFormulario.get('pais')?.valueChanges
        .pipe(
          tap( ( _ )  => { 
            this.fronteras = [];
            this.miFormulario.get('frontera')?.reset(''); 
            this.cargando = true;
          }),
          switchMap( codigo => this.paisesService.getPaisPorCodigo( codigo ) ),
          switchMap( pais => this.paisesService.getPaisesPorCodigos ( pais?.borders! ) ) 
        )
        .subscribe( paises => {
          this.cargando = false;
          if( paises.length > 0 ){
             this.miFormulario.get('frontera')?.enable();
             this.fronteras = paises;
            }
            else{
            this.miFormulario.get('frontera')?.setErrors(null); // con esto el form se pone valid  
            //si existe el pais y no tiene fronteras entonces le quito el error porque aja es valido
             // delete this.miFormulario.get('frontera')?.errors?.['required']; 
           // eneste caso esto no vale porquye si lo borra pero queda el objeto vacio y no lo deja valido por eso borro todo 
           //rela porque en este caso es la unica validacion
            }
          
            // this.fronteras = pais?.borders || [] 
            //ASI ERA ANTES DE QUE LO MODIFICARA PARA MOSTRAR LOS NOMBRES DE LOS PAISES EN VEZ DEL CODIGO; 
          // if( pais?.name && !pais.borders ){ 
          
          // }
        })


    // //cuando cambia el pais MI SOLUCION
    // this.miFormulario.get('pais')?.valueChanges
    // .pipe(
    //     tap( ( _ )  => this.miFormulario.get('frontera')?.reset('')),
    //     switchMap( pais => (pais) ? this.paisesService.getPaisPorCodigo( pais ) : of())
    // )  
    // .subscribe( ({ borders }) => {
    //         if( borders ){
    //           this.miFormulario.get('frontera')?.enable();
    //           this.fronteras = borders;
    //         }  
    //       });

  }

  campoNoValido( campo: string ){

    return this.miFormulario.controls[campo].errors 
      && this.miFormulario.controls[campo].touched;
  }

  guardar(){

    this.miFormulario.markAllAsTouched();
    if( this.miFormulario.valid){
      console.log( 'Formulario enviado')
      console.log( this.miFormulario.value ); 
    }
    else{
      console.log( 'formulario invalido ')
    }
  }

}
