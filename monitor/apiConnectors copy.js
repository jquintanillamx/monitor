
const url = {
  Token : "https://apiaxp.contactcenter.sears.com.mx/SecureTockenAPI/TransactionGatewayAPI/SPB_SearsVisa/SecureTokenAPI/ConsultToken",
  gestionCobranza : "https://apiaxp.contactcenter.sears.com.mx/cobranza/ServiciosSearsVisa/spb_services/GestionCobranza",
  encryPan : "https://apiaxp.contactcenter.sears.com.mx/EncryptPanAPI/TransactionGatewayAPI/SPB_SearsVisa/EncriptaPan",
}

    

 export async function apiConnect() {


    /* const URL_API_Token = "https://apiaxp.contactcenter.sears.com.mx/SecureTockenAPI/TransactionGatewayAPI/SPB_SearsVisa/SecureTokenAPI/ConsultToken";
    const URL_API_gestionCobranza = "https://apiaxp.contactcenter.sears.com.mx/cobranza/ServiciosSearsVisa/spb_services/GestionCobranza";
    const URL_API_encryPan = "https://apiaxp.contactcenter.sears.com.mx/EncryptPanAPI/TransactionGatewayAPI/SPB_SearsVisa/EncriptaPan";
 */

    //const { compania, cuenta, numeroTarjeta } = window;
    const compania = "2";
    const cuenta = window.cuenta;
    const numeroTarjeta = window.numeroTarjeta;
    let apiOk = false;
    let tokenResponse = null;
  
    const token = new createRequest("consultToken", compania);
  

    try {
      tokenResponse = await postURL(url.Token, token);
     
      window.apiToken = true;
      apiOk = true;
    } catch (error) {
      console.error("Fallo en API Token", error);
      window.apiToken = false;
      return; // Termina la ejecución si falla el token
    }
  
    if (apiOk) {
      let encryPANResponse = await handleEncriptaPan(compania, tokenResponse.token, cuenta, numeroTarjeta);
      
      if (encryPANResponse) {
        await handleGestionCobranza(compania, tokenResponse.token, encryPANResponse.panEncrypt, encryPANResponse.tipoPan);
      }
    }
  }
  
  async function handleEncriptaPan(compania, token, cuenta, numeroTarjeta) {
    let tipoPanEncry = "1";
    let encryPANResponse = null;
    
    try {
       
      encryPANResponse = await postURL(url.encryPan, createRequest("encriptaPan", compania, token, cuenta, tipoPanEncry));
      
      window.apiencryptPAN = true;
    } catch (error) {
      console.error("Fallo en encriptaPan con cuenta, intentando con numeroTarjeta y tipoPan 2", error);
      window.apiencryptPAN = false;
      tipoPanEncry = "2";
      try {
        encryPANResponse = await postURL(url.encryPan, createRequest("encriptaPan", compania, token, numeroTarjeta, tipoPanEncry));
        window.apiencryptPAN = true;
      } catch (error) {
        console.error("Fallo en API encriptaPan con numeroTarjeta", error);
        window.apiencryptPAN = false;
      }
    }
   
    return encryPANResponse ? { ...encryPANResponse, tipoPan: tipoPanEncry } : null;
  }
  
  async function handleGestionCobranza(compania, token, pan, tipoPanEncry) {
    const gcobraza = createRequest("gestionCobranza", compania, token, pan, tipoPanEncry);
   
    try {
      await postURL(url.gestionCobranza, gcobraza);
      window.apiCobranza = true;
    } catch (error) {
      console.error("Fallo en API gestionCobranza", error);
      window.apiCobranza = false;
    }
  }
  
  function createRequest(nombreServicio, tipoCompania, token = "", pan = "", tipoPan = "") {
    return {
      fechaTransaccion: formatearFecha(new Date()),
      horaTransaccion: formatearHora(new Date()),
      nombreServicio,
      tipoCompania,
      ipOrigen: "20.75.61.25",
      solicitadoPor: "5",
      pan,
      tipoPan,
      token,
    };
  }
  
  async function postURL(URL, objeto) {
    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(objeto),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
  
  function formatearFecha(date) {
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
  
  function formatearHora(date) {
    const horas = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");
    const segundos = String(date.getSeconds()).padStart(2, "0");
    return `${horas}:${minutos}:${segundos}`;
  }
  