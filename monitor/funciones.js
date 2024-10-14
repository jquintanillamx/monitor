import {continueGestionCobranza} from "./apiConnectors.js"
import { showNotification } from './notification.js';



export function modifyPanelButtons(panel,objetoEncPAN) {
  const customPanelButton = panel.querySelector("custom-panel-button[style='order: 3;']");
  if (customPanelButton) {
    console.log("detecto custom panelbuton")
    const clonedPanelButton = customPanelButton.cloneNode(true);
    clonedPanelButton.style.order = '1';
    clonedPanelButton.setAttribute('data-cloned', 'true');

    const button = clonedPanelButton.querySelector('button#cardActionButton');
    button.className = 'neo-btn neo-btn-square neo-btn-square-tertiary neo-btn-square-primary--success neo-icon-input-output';

    // Almacenar el resultado de apiConnect para ambas funciones
    

    // Definir el event listener original como una función nombrada
    async function originalClickHandler(event) {
      console.log('Botón clonado clicado');

      console.log(objetoEncPAN)

      try {

        
      //  apiResult = await apiConnect();  // Llamada a la API
        if (objetoEncPAN.success) {
          showNotification('Conexión a DB exitosa', 'La operación se completó.', 'success');

          const endWork = panel.querySelector("custom-panel-button[style='order: 3;']");
          const codeCompletion = panel.querySelector("custom-panel-button[style='order: 4;']");
          const csshidden = `
            visibility: hidden;
            margin: 0px;
            border: 0px;
            width: 0px;
            height: 0px;
          `;

          if (endWork && codeCompletion) {
            endWork.style.cssText += csshidden;
          //  showNotification("Botón endWork", "Borrado", "info");
            codeCompletion.style.cssText += csshidden;
         //   showNotification('Botón codeCompletion', 'Borrado', 'info');
          }

          // Cambiar la clase del botón
          button.className = 'neo-btn neo-btn-square neo-btn-square-tertiary neo-btn-square-primary--success neo-icon-call-end';

          // Eliminar el event listener original
          clonedPanelButton.removeEventListener('click', originalClickHandler);

          // Agregar un nuevo event listener con la nueva lógica
          clonedPanelButton.addEventListener('click', (event) => newClickHandler(event, objetoEncPAN));

        } else {

          const buttonErr = document.querySelector('custom-panel-button[data-cloned="true"]');
          if (buttonErr) {
            buttonErr.style.cssText = `
            visibility: hidden;
            margin: 0px;
            border: 0px;
            width: 0px;
            height: 0px;
          `;
          }

          showNotification('Error en la conexión', 'Hubo un problema con la operación.', 'alert');


        }
      } catch (error) {
        showNotification('Error crítico', 'No se pudo completar la operación.', 'alert');
        console.error('Error al conectar con la API:', error);
      }
    }

    // Definir la nueva lógica como una función separada
    async function  newClickHandler(event, result) {
      let gcobranza = await continueGestionCobranza(result.data);

      console.log(gcobranza);
      // Utiliza el resultado de apiConnect aquí
      if (gcobranza && gcobranza.success) {
        showNotification("Nuevo evento","Se ha ejecutado la nueva lógica del botón.","info");

        // logica de boton
        let idCodigoResultado = gcobranza.data.datosGestion.idCodigoResultado;
        console.log(idCodigoResultado);
        const buttonDisp_org = panel.querySelector("button#cardActionButton.neo-icon-backspace");
//        let selectorDisposicion = panel.querySelector(`[puppeteer-id="dropdown__link-item--${idCodigoResultado}"]`);
let selectorDisposicion = panel.querySelector(`[puppeteer-id^="dropdown__link-item--${idCodigoResultado}-"]`);

        const buttonendWork = panel.querySelector("button#cardActionButton.neo-icon-work-end");

        console.log(selectorDisposicion);

        buttonDisp_org.click();
        selectorDisposicion.click();

        if (window.scobranza && !window.scobranza.closed) {
          window.scobranza.close(); 
        }
        buttonendWork.click();

        //
      } else {

        const endWork =        panel.querySelector("custom-panel-button[style='order: 3; visibility: hidden; margin: 0px; border: 0px; width: 0px; height: 0px;']");
        const codeCompletion = panel.querySelector("custom-panel-button[style='order: 4; visibility: hidden; margin: 0px; border: 0px; width: 0px; height: 0px;']");
        const customButton = document.querySelector('custom-panel-button[data-cloned="true"]');

       
        // Quitar los estilos específicos
codeCompletion.style.removeProperty('visibility');
codeCompletion.style.removeProperty('margin');
codeCompletion.style.removeProperty('border');
codeCompletion.style.removeProperty('width');
codeCompletion.style.removeProperty('height');
endWork.style.removeProperty('visibility');
endWork.style.removeProperty('margin');
endWork.style.removeProperty('border');
endWork.style.removeProperty('width');
endWork.style.removeProperty('height');


        

        customButton.style.cssText += `
            visibility: hidden;
            margin: 0px;
            border: 0px;
            width: 0px;
            height: 0px;
          `;



        showNotification("Failed","No se pudo completar la nueva operación, ingresar Código de Resultado manualmente.","alert");
      }
    }

    // Agregar el event listener original
    clonedPanelButton.addEventListener('click', originalClickHandler);

    // Insertar el botón clonado en el DOM
    customPanelButton.insertAdjacentElement('afterend', clonedPanelButton);
    clonedPanelButton.style.visibility = 'visible';

    console.log('Botón clonado y orden establecido en 1 exitosamente.');
  } else {
    console.log('No se pudo encontrar el botón necesario para clonar.');
  }
}






/*  function modifyPanelButtons(panel) {
  // Verificar si el botón clonado ya existe usando un atributo o clase específica
  const customPanelButton = panel.querySelector("custom-panel-button[style='order: 3;']");
  if (customPanelButton) {
    const clonedPanelButton = customPanelButton.cloneNode(true);
    clonedPanelButton.style.order = '1';
    clonedPanelButton.setAttribute('data-cloned', 'true'); // Marcar el botón clonado con un atributo único

    const button = clonedPanelButton.querySelector('button#cardActionButton');

    button.className = 'neo-btn neo-btn-square neo-btn-square-tertiary neo-btn-square-primary--success neo-icon-input-output';
    let result;
    // Definir el event listener original como una función nombrada
    async function originalClickHandler(event) {
      console.log('Botón clonado clicado');

      try {
         result = await apiConnect();
        if (result.success) {
          showNotification('Conexión exitosa', 'La operación se completó con éxito.', 'success');

          const endWork = panel.querySelector("custom-panel-button[style='order: 3;']");
          const codeCompletion = panel.querySelector("custom-panel-button[style='order: 4;']");
          const csshidden = `
            visibility: hidden;
            margin: 0px;
            border: 0px;
            width: 0px;
            height: 0px;
          `;

          if (endWork && codeCompletion) {
            endWork.style.cssText = csshidden;
            showNotification("Botón endWork", "Borrado", "info"); //FIXME: Borrar
            codeCompletion.style.cssText = csshidden;
            showNotification('Botón codeCompletion', 'Borrado', 'info');
          }

          // Cambiar la clase del botón
          button.className = 'neo-btn neo-btn-square neo-btn-square-tertiary neo-btn-square-primary--success neo-icon-call-end';

          // Eliminar el event listener original
          clonedPanelButton.removeEventListener('click', originalClickHandler);

          // Agregar un nuevo event listener con la nueva lógica
          clonedPanelButton.addEventListener('click', newClickHandler(event,result));

        } else {
          showNotification('Error en la conexión', 'Hubo un problema con la operación.', 'alert');
        }
      } catch (error) {
        showNotification('Error crítico', 'No se pudo completar la operación.', 'alert');
        console.error('Error al conectar con la API:', error);
      }
    }

    // Definir la nueva lógica como una función separada
    function newClickHandler(event,apiResultado) {
      console.log('Nueva lógica ejecutada para el botón clonado.');
      // Aquí va la nueva lógica que quieres implementar
      if (apiResultado && apiResultado.success) {
        showNotification('Nuevo evento', 'Se ha ejecutado la nueva lógica del botón.', 'info');
      } else {
        showNotification('Nuevo evento', 'No se pudo completar la nueva operación.', 'alert');
      }
    }

    // Agregar el event listener original
    clonedPanelButton.addEventListener('click', originalClickHandler);

    // Insertar el botón clonado en el DOM
    customPanelButton.insertAdjacentElement('afterend', clonedPanelButton);

    clonedPanelButton.style.visibility = 'visible';

    console.log('Botón clonado y orden establecido en 1 exitosamente.');
  } else {
    console.log('No se pudo encontrar el botón necesario para clonar.');
  }
} */
/* function modifyPanelButtons(panel) {
    // Verificar si el botón clonado ya existe usando un atributo o clase específica

      const customPanelButton = panel.querySelector("custom-panel-button[style='order: 3;']");
      if (customPanelButton) {
        const clonedPanelButton = customPanelButton.cloneNode(true);
        clonedPanelButton.style.order = '1';
        clonedPanelButton.setAttribute('data-cloned', 'true'); // Marcar el botón clonado con un atributo único

        const button = clonedPanelButton.querySelector('button#cardActionButton');

        button.className = 'neo-btn neo-btn-square neo-btn-square-tertiary neo-btn-square-primary--success neo-icon-input-output'





         
        clonedPanelButton.addEventListener('click', async (event) => {
          console.log('Botón clonado clicado');

          


          try {
            const result = await apiConnect();
            if (result.success) {
              showNotification('Conexión exitosa', 'La operación se completó con éxito.', 'success');

              //
              const endWork = panel.querySelector("custom-panel-button[style='order: 3;']");
              const codeCompletion = panel.querySelector("custom-panel-button[style='order: 4;']");
              const csshidden = `
                visibility: hidden;
                margin: 0px;
                border: 0px;
                width: 0px;
                height: 0px;
                `

              if (endWork && codeCompletion )  {
                endWork.style.cssText = csshidden
                showNotification("Boton endWork", "Borrado", "info"); //FIXME: Boorar
                codeCompletion.style.cssText = csshidden
                showNotification('Boton codeCompletion','Borrado', 'info');
              }



                button.className = 'neo-btn neo-btn-square neo-btn-square-tertiary neo-btn-square-primary--success neo-icon-call-end'

/// si llego hasta aqui necesito eliminar el evento y crear uno nuevo 

               } else {
              showNotification('Error en la conexión', 'Hubo un problema con la operación.', 'alert');
            }
          } catch (error) {
            showNotification('Error crítico', 'No se pudo completar la operación.', 'alert');
            console.error('Error al conectar con la API:', error);
          }
        });


        // Aquí puedes agregar la lógica que necesites al hacer clic en el botón clonado
        

        customPanelButton.insertAdjacentElement('afterend', clonedPanelButton);

        clonedPanelButton.style.visibility = 'visible';

        console.log('Botón clonado y orden establecido en 1 exitosamente.');
      } else {
        console.log('No se pudo encontrar el botón necesario para clonar.');
      }
   
  } */