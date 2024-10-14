const url = {
  Token: "https://apiaxp.contactcenter.sears.com.mx/SecureTockenAPI/TransactionGatewayAPI/SPB_SearsVisa/SecureTokenAPI/ConsultToken",
  gestionCobranza: "https://apiaxp.contactcenter.sears.com.mx/cobranza/ServiciosSearsVisa/spb_services/GestionCobranza",
  encryPan: "https://apiaxp.contactcenter.sears.com.mx/EncryptPanAPI/TransactionGatewayAPI/SPB_SearsVisa/EncriptaPan",
//Token:            "https://searsvisaprod.sears.com.mx:8443/SecureTockenAPI/TransactionGatewayAPI/SPB_SearsVisa/SecureTokenAPI/ConsultToken",  
 // gestionCobranza:  "https://avayaprod.sears.com.mx:8443/cobranza/ServiciosSearsVisa/spb_services/GestionCobranza",
 // encryPan:         "https://searsvisaprod.sears.com.mx:8443/EncryptPanAPI/TransactionGatewayAPI/SPB_SearsVisa/EncriptaPan",



};

let encryPANData = null; // Variable global para almacenar el resultado de encriptaPan

export async function apiConnect(cuentaIn,numeroTarjetaIn) {
  const compania = "2";
  
  let cuenta = "";

  if (cuentaIn.length < 10) {
    cuenta = convertirADiezDigitos(cuentaIn);
  } else {
    cuenta = cuentaIn;
  }

  const numeroTarjeta = numeroTarjetaIn;
  let apiOk = false;
  let tokenResponse = null;

  const token = createRequest("consultToken", compania);

  console.log(token);

  try {
    tokenResponse = await postURL(url.Token, token);
    window.apiToken = true;
    apiOk = true;
    console.log(tokenResponse);
  } catch (error) {
    console.error("Fallo en API Token", error);
    window.apiToken = false;
    return { success: false, message: "Fallo en API Token" }; // Devuelve el fallo
  }

  if (apiOk) {
    encryPANData = await handleEncriptaPan(compania, tokenResponse.token, cuenta, numeroTarjeta);
    console.log(encryPANData);
    if (encryPANData) {
      return { success: true, message: "EncriptaPan completado con éxito", data: encryPANData }; 
    } else {
      return { success: false, message: "Fallo en API EncriptaPan" }; // Devuelve el fallo
    }
  }
}

// Esta función se puede llamar cuando se desee continuar con el flujo de cobranza
export async function continueGestionCobranza(encryPAND) {
  if (encryPAND) {
    try {
      const cobranzaResponse = await handleGestionCobranza(encryPAND.tipoCompania, encryPAND.token, encryPAND.panEncrypt, encryPAND.tipoPan);
      return { success: true, message: "Operación completada con éxito", data: cobranzaResponse };
    } catch (error) {
      return { success: false, message: "Fallo en API Gestion Cobranza" }; // Devuelve el fallo
    }
  } else {
    return { success: false, message: "No se puede continuar, EncriptaPan falló o no se ha ejecutado" };
  }
}

async function handleEncriptaPan(compania, token, cuenta, numeroTarjeta) {
  let tipoPanEncry = "1";
  let encryPANResponse = null;

  try {
    console.log(createRequest("encriptaPan", compania, token, cuenta, tipoPanEncry));
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
      return null;
    }
  }


  if (encryPANResponse && encryPANResponse.codigo === "00") {
    return { ...encryPANResponse, tipoCompania: compania, token, tipoPan: tipoPanEncry };
  } else {
    console.error("Fallo en API EncriptaPan: Código incorrecto");
    return null;
  }
}






async function handleGestionCobranza(compania, token, pan, tipoPanEncry) {
  const gcobraza = createRequest("gestionCobranza", compania, token, pan, tipoPanEncry);
  try {
    const responsegC = await postURL(url.gestionCobranza, gcobraza);

    console.log("esta es ", responsegC)
    // Validar que la respuesta tenga un código "00"
    if (responsegC && responsegC.codigo === "00") {
      window.apiCobranza = true;
      return responsegC;
    } else {
      window.apiCobranza = false;
      throw new Error("Fallo en API Gestion Cobranza: Código incorrecto");
    }
  } catch (error) {
    console.error("Fallo en API Gestion Cobranza", error);
    window.apiCobranza = false;
    throw error;
  }
}

/* 
async function handleGestionCobranza(compania, token, pan, tipoPanEncry) {
  const gcobraza = createRequest("gestionCobranza", compania, token, pan, tipoPanEncry);
  console.log(gcobraza);
  try {
    const responsegC = await postURL(url.gestionCobranza, gcobraza);
    window.apiCobranza = true;
    console.log(responsegC);
    return responsegC;
  } catch (error) {
    console.error("Fallo en API Gestion Cobranza", error);
    window.apiCobranza = false;
    throw error;
  }
}

 */



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


async function postURL(URL, objeto, timeout = 20000) {
  // Crear una promesa que se rechaza después de un tiempo determinado
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), timeout)
  );

  // La promesa de la petición fetch
  const fetchPromise = fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(objeto),
  });

  try {
    // Utilizar Promise.race para competir entre la petición y el timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
console.log("esta es la respuesta",response)
    if (!response.ok) {
      console.log("esta es la respuesta",response)

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    
    console.error("Error:", error);
    throw error;
  }
}

/* async function postURL(URL, objeto) {
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
      console.log(data)
    if (data.codigo !== "00") {
      throw new Error(`Error en respuesta: código ${data.codigo}`);
    }


    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
} */

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

function convertirADiezDigitos(numero) {
  let numeroStr = numero.toString();
  while (numeroStr.length < 10) {
    numeroStr = "0" + numeroStr;
  }
  return numeroStr;
}
