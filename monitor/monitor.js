import {modifyPanelButtons} from './funciones.js'
import { apiConnect } from './apiConnectors.js';

class Monitor extends HTMLElement {
  constructor() {
    super();
    this.logContainer = null;
    this.observer = null;
    this.customPanelObserver = null;
    this.interactionObserver = null;
    this.customStateObserver = null;
    this.cuenta = null;
    this.firstName = null;
    this.numeroTarjeta = null;
    this.panelStatus = null;
    this.cancelButton = null;
    this.callButton = null;
    this.dialClicked = false;
    this.objetoEncPAN = "";
  }

  connectedCallback() {
    const button = document.querySelector(
      'button[puppeteer-id="navbar__Monitor-button"]'
    );
    const parentDiv = button.parentElement;
    const grandparentDiv = parentDiv.parentElement;
    grandparentDiv.style.visibility = 'hidden';  // TODO: quitar para que se quite el log
    const navBarRight = document.querySelector(
      'div[puppeteer-id="navbar-right"]'
    );
    const tooltips = navBarRight.querySelectorAll("asl-tooltip");

    if (tooltips.length >= 4) {
      const fourthChild = tooltips[3];
      navBarRight.insertBefore(fourthChild, tooltips[0]);
    }

    this.render();
    this.logContainer = this.querySelector("#log");
    this.initWidgetCode();
    this.monitorPomDetailsWidget();
    this.monitorWorkArea();
    
  }

  disconnectedCallback() {
    this.cleanupObservers();
  }













  cleanupObservers() {
    if (this.customPanelObserver) {
      this.customPanelObserver.disconnect();
      this.customPanelObserver = null;
    }
    if (this.interactionObserver) {
      this.interactionObserver.disconnect();
      this.interactionObserver = null;
    }
    if (this.customStateObserver) {
      this.customStateObserver.disconnect();
      this.customStateObserver = null;
    }
  }

  render() {
    this.innerHTML = `
      <div class="monitoreo-widget">
        <p>Se monitorearÃ¡ toda la pÃ¡gina</p>
        <div id="log" style="max-height: 800px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; background-color: #f9f9f9;"></div>
      </div>`;
  }

  initWidgetCode() {
    this.observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
      //  maskInputValue();
        if (this.contains(mutation.target)) {
          continue;
        }

        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === "CUSTOM-PANEL") {
              this.logChange(`Se ha agregado un nodo: ${node.nodeName}`);
              this.monitorPanelStatus(node);

              if (window.callEnded === true)
              {
                modifyPanelButtons(node,this.objetoEncPAN);
              }

            }
          });
        }


      }
    });

    this.observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

    
  logChange(message) {
    const logEntry = document.createElement("div");
    logEntry.textContent = message;
    this.logContainer.appendChild(logEntry);
  }

  monitorPomDetailsWidget() {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === "POM-DETAILS-WIDGET") {
              this.handlePomDetailsWidget(node);
              this.startMonitoringPomDetailsWidget()
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }


  startMonitoringPomDetailsWidget() {
    const widgetNode = document.querySelector('POM-DETAILS-WIDGET');
    
    if (widgetNode) {
      const widgetObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
          //  this.logChange('Cambios en la lista de hijos de POM-DETAILS-WIDGET detectados.');
            mutation.addedNodes.forEach(node => {
             
                // Esperar hasta que el input tenga un valor antes de enmascararlo
                
                  
                    this.maskInputValue();
                 // Detener el intervalo cuando se aplique el enmascaramiento
                  
            });
          }
    
        }
      });
  
      widgetObserver.observe(widgetNode, {
        childList: true,       // Observar cambios en los hijos
        subtree: true,         // Observar todos los descendientes
        
      });
  
     
    } else {
      this.logChange('POM-DETAILS-WIDGET no encontrado para monitoreo.');
    }
  }



  maskInputValue() {
    const inputElement = document.getElementById("inputEditableNUMERO_TARJETA");
    if (inputElement) {
            // Asegurarse de que el tipo del input sea text para mostrar el valor enmascarado
      inputElement.type = "password";
    }
  }

  async handlePomDetailsWidget(widget) {
    setTimeout(async () => {
      const moreInfoButton = widget.querySelector("#moreInformation");
      if (moreInfoButton) {
        moreInfoButton.click();
        this.logChange('BotÃ³n "More Information" clicado.');
  
        setTimeout(async () => {
          this.cuenta = widget.querySelector("#inputEditableCUENTA")?.value;
          this.firstName = widget.querySelector(
            "#inputEditableFirstName"
          )?.value;
          this.numeroTarjeta = widget.querySelector(
            "#inputEditableNUMERO_TARJETA"
          )?.value;
  
          this.logChange(`CUENTA: ${this.cuenta}`);
          this.logChange(`First Name: ${this.firstName}`);
          this.logChange(`NÃºmero de Tarjeta: ${this.numeroTarjeta}`);
  
         /*  window.cuenta = this.cuenta;
          window.name = this.firstName;
          window.tarjeta = this.numeroTarjeta; */
  
          const seeLessButton = widget.querySelector("#seeLessInformation");
          if (seeLessButton) {
            seeLessButton.click();
            this.logChange('BotÃ³n "See Less Information" clicado.');
            this.objetoEncPAN = await apiConnect(this.cuenta,this.numeroTarjeta);
            console.log("aqui el resultado ");
            console.log(this.objetoEncPAN);
          }
        }, 500);
      } else {
        this.logChange('BotÃ³n "More Information" no encontrado.');
      }
    }, 500);
  }
  



  /*  handlePomDetailsWidget(widget) {
    setTimeout(() => {
      const moreInfoButton = widget.querySelector("#moreInformation");
      if (moreInfoButton) {
        moreInfoButton.click();
        this.logChange('BotÃ³n "More Information" clicado.');

        setTimeout(async () => {
          this.cuenta = widget.querySelector("#inputEditableCUENTA")?.value;
          this.firstName = widget.querySelector(
            "#inputEditableFirstName"
          )?.value;
          this.numeroTarjeta = widget.querySelector(
            "#inputEditableNUMERO_TARJETA"
          )?.value;

          this.logChange(`CUENTA: ${this.cuenta}`);
          this.logChange(`First Name: ${this.firstName}`);
          this.logChange(`NÃºmero de Tarjeta: ${this.numeroTarjeta}`);

          window.cuenta = this.cuenta;
          window.name = this.firstName;
          window.tarjeta = this.numeroTarjeta;
        //  this.maskInputValue();

        

          const seeLessButton = widget.querySelector("#seeLessInformation");
          if (seeLessButton) {
            seeLessButton.click();
            this.logChange('BotÃ³n "See Less Information" clicado.');
             this,objetoEncPAN = await apiConnect();
            console.log("aqui el resoltado ")
            console.log (this.objetoEncPAN)
          }
        }, 500);
      } else {
        this.logChange('BotÃ³n "More Information" no encontrado.');
      }
    }, 500);
  }
 */
  monitorCustomPanel() {
    this.customPanelObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === "CUSTOM-PANEL") {
              this.handleCustomPanel(node);
            }
          });
        }
      }
    });

    this.customPanelObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }


  


  async handleCustomPanel(panel) {
    await this.delay(500);

    this.cancelButton = panel.querySelector(
      ".neo-btn.neo-btn-square.neo-btn-square-primary.neo-btn-square-primary--alert.neo-icon-close"
    );
    this.callButton = panel.querySelector(
      ".neo-btn.neo-btn-square.neo-btn-square-primary.neo-btn-square-primary--success.neo-icon-call"
    );

    if (this.cancelButton) {
      this.cancelButton.addEventListener("click", async () => {
        if (document.body.contains(this.cancelButton)) {
          this.logChange('BotÃ³n "Cancel Preview" clicado.');


window.cancelPreviewActive = true;

          await this.stopCustomPanelObserver();
          this.removeButtonListeners();
        }
      });
    }
    // ##########################

   

    // ##########################

    if (this.callButton) {
      this.callButton.addEventListener("click", () => {
        if (document.body.contains(this.callButton)) {
          this.logChange('BotÃ³n "Dial" clicado.');
          this.handleDialClick(
            this.cuenta,
            this.firstName,
            this.numeroTarjeta,
            this.logChange.bind(this)
          );
          this.dialClicked = true;
       //   this.waitForEndOfCall(panel);
        }
      });
    }


    /// dsdsdsdsd TODO: si no jala quitalo

  

// tester

  }





  async waitForEndOfCall(panel) {
    const backspaceButtonSelector = "button#cardActionButton.neo-icon-backspace";
    const workEndButtonSelector   = "button#cardActionButton.neo-icon-work-end";

    const checkButtonsExistence = () => {
      const backspaceButton = panel.querySelector(backspaceButtonSelector);
      const workEndButton = panel.querySelector(workEndButtonSelector);

      if (backspaceButton && workEndButton) {
        this.logChange("Llamada finalizada. Ambos botones detectados.");
        //   modifyPanelButtons(this.logChange.bind(this));
        modifyPanelButtons(panel,this.objetoEncPAN)
        // Guardar la bandera en window
        window.callEnded = true;
      } else {
        setTimeout(checkButtonsExistence, 250);
      }
    };

    if (this.dialClicked) {
      checkButtonsExistence();
    }
  }

  monitorPanelStatus(panel) {
    const summaryElement = panel.querySelector(
      '[puppeteer-id="custom-info--summary"]'
    );

    if (summaryElement) {
      this.customStateObserver = new MutationObserver(() => {
        const status = summaryElement.textContent.split(":")[0].trim();
        this.panelStatus = status;
        this.logChange(`Estado del panel detectado: ${this.panelStatus}`);

        if (this.panelStatus === "Dialing") {
          // Restablecer cancelPreviewActive si estÃ¡ en true
          if (window.cancelPreviewActive) {
            window.cancelPreviewActive = false;
          }

          // Si el monitoreo del custom panel estÃ¡ detenido, volver a iniciarlo
          if (!this.customPanelObserver) {
            this.monitorCustomPanel();
            this.logChange("Monitoreo del custom panel reiniciado.");
          }

          // Ejecutar la lÃ³gica de handleDialClick
          this.handleDialClick(
            this.cuenta,
            this.firstName,
            this.numeroTarjeta,
            this.logChange.bind(this)
          );
          this.dialClicked = true;

          // Esperar el fin de la llamada para cargar el botÃ³n
          this.waitForEndOfCall(panel).then(() => {
            this.logChange("Fin de llamada detectado. Se procederÃ¡ a modificar los botones.");
            // AquÃ­ puedes agregar cualquier otra lÃ³gica que necesites
          });
        }
      });

      this.customStateObserver.observe(summaryElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }

/* 
  monitorPanelStatus(panel) {
    const summaryElement = panel.querySelector(
      '[puppeteer-id="custom-info--summary"]'
    );

    if (summaryElement) {
      this.customStateObserver = new MutationObserver(() => {
        const status = summaryElement.textContent.split(":")[0].trim();
        this.panelStatus = status;
        this.logChange(`Estado del panel detectado: ${this.panelStatus}`);

        if (this.panelStatus === "Dialing") {
          // Restablecer cancelPreviewActive si estÃ¡ en true
          if (window.cancelPreviewActive) {
            window.cancelPreviewActive = false;
          }

          // Si el monitoreo del custom panel estÃ¡ detenido, volver a iniciarlo
          if (!this.customPanelObserver) {
            this.monitorCustomPanel();
            this.logChange("Monitoreo del custom panel reiniciado.");
          }

          // Ejecutar la lÃ³gica de handleDialClick
          handleDialClick(
            this.cuenta,
            this.firstName,
            this.numeroTarjeta,
            this.logChange.bind(this)
          );
          this.dialClicked = true;
          this.waitForEndOfCall(panel);
        }
      });

      this.customStateObserver.observe(summaryElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }

 */

/*   monitorPanelStatus(panel) {
    const summaryElement = panel.querySelector(
      '[puppeteer-id="custom-info--summary"]'
    );

    if (summaryElement) {
      this.customStateObserver = new MutationObserver(() => {
        const status = summaryElement.textContent.split(":")[0].trim();
        this.panelStatus = status;
        this.logChange(`Estado del panel detectado: ${this.panelStatus}`);
      });

      this.customStateObserver.observe(summaryElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  } */

  removeButtonListeners() {
    if (this.cancelButton) {
      this.cancelButton.removeEventListener("click", this.handleCustomPanel);
    }
    if (this.callButton) {
      this.callButton.removeEventListener("click", this.handleCustomPanel);
    }
  }

  async stopCustomPanelObserver() {
    return new Promise((resolve) => {
      if (this.customPanelObserver) {
        this.customPanelObserver.disconnect();
        this.customPanelObserver = null;
        this.logChange("DejÃ³ de monitorear el custom panel.");

        this.cancelButton = null;
        this.callButton = null;

        resolve();
      } else {
        resolve();
      }
    });
  }

  monitorWorkArea() {
    const workArea = document.querySelector("ws-work-area");
    this.dialClicked = false;
    window.callEnded = false; // Reiniciar la variable callEnded a false
    if (workArea) {
      this.interactionObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeName === "CARD") {
                window.callEnded = false;
                if (window.scobranza && !window.scobranza.closed) {
                  window.scobranza.close(); 
                }
                window.scobranza = null;
                this.logChange(
                  `Nueva interacciÃ³n detectada con ID: ${node.getAttribute(
                    "interaction-id"
                  )}`
                );
                this.handleInteraction(node);
              }
            });
          }
        }
      });

      this.interactionObserver.observe(workArea, {
        childList: true,
        subtree: true,
      });
    } else {
      this.logChange("No se encontrÃ³ el ws-work-area en el DOM.");
    }
  }

  async handleInteraction(interaction) {
    this.logChange(
      `InteracciÃ³n detectada con ID: ${interaction.getAttribute(
        "interaction-id"
      )}`
    );
    window.callEnded = false;
    window.openURL =false;
    if (!this.customPanelObserver) {
      await this.monitorCustomPanel();
      this.logChange("Monitoreo de custom-panel iniciado.");
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  reloadCustomPanel(panel) {
    if (panel) {
      const originalContent = panel.innerHTML;
      panel.innerHTML = ""; // Vaciar el contenido
      panel.innerHTML = originalContent; // Restaurar el contenido
  
      this.logChange("El contenido del nodo custom-panel ha sido recargado.");
    }
  }


   handleDialClick(cuenta, firstName, numeroTarjeta, logChange) {
    if (!window.openURL) {
      let url = `https://icobranza.sears.com.mx/icobranza/Financieros/MarcadorSears?Cuenta=${cuenta}&Tarjeta=${numeroTarjeta}`;
      logChange(`La URL que se va a abrir es: ${url}`);
       window.scobranza = window.open(url,'_blank');
    
      window.openURL = true;
     // alert(url)
    }
    logChange("LÃ³gica de Dial ejecutada.");
  
  
  }



}

customElements.define("monitor-widget-jqr", Monitor);
