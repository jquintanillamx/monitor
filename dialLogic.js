export function handleDialClick(cuenta, firstName, numeroTarjeta, logChange) {
  if (!window.openURL) {
    let url = `https://apiaxp.contactcenter.sears.com.mx/icobranza/Financieros/MarcadorSears?Cuenta=${cuenta}&Tarjeta=${numeroTarjeta}`;
    logChange(`La URL que se va a abrir es: ${url}`);
    // $$$$$$$$$$$$$  window.open(url,'_blank');
    window.openURL = true;
   // alert(url)
  }
  logChange("Lógica de Dial ejecutada.");


}
