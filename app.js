const CSV_URL = "https://docs.google.com/spreadsheets/d/1E-WGA8NSZV5uy6d2w8tzzFUKAKAmJ-OcjlzhbBEGCXM/export?format=csv&t=" + new Date().getTime();

document.addEventListener("DOMContentLoaded", () => {
    initWillemLoadingAnimation();
    loadMenuData();
});

function loadMenuData() {
    const loader = document.getElementById("app-loader");
    const errorMessage = document.getElementById("error-message");
    
    Papa.parse(CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            // Ocultar loader
            if(loader) loader.style.display = "none";
            
            // Verificar si hay datos validos
            if(results.data.length === 0) {
                if(errorMessage) errorMessage.style.display = "block";
                return;
            }
            
            // Mapear los datos según los nombres de las columnas del CSV
            const mappedData = results.data
                .filter(row => row["Nombre del Plato"]) // Evitar filas vacías
                .map((row, index) => ({
                    id: String(index),
                    name: row["Nombre del Plato"],
                    ingredients: row["Descripción"],
                    video2d: row["Video 2D"],
                    delay: row["Demora"],
                    calories: row["Calorías"],
                    price: row["Precio"],
                    model3d: row["Link del archivo 3D"]
                }));
            
            renderMenu(mappedData);
        },
        error: function(error) {
            console.error("Error obteniendo el CSV:", error);
            if(loader) loader.style.display = "none";
            if(errorMessage) errorMessage.style.display = "block";
        }
    });
}

function renderMenu(data) {
    const menuContainer = document.getElementById("menu-feed");
    
    data.forEach((item, index) => {
        // Añadimos un pequeño delay de animación basado en el índice
        const animationDelay = index * 0.15;
        
        const cardHTML = `
            <article class="menu-card anim-fade-in-up" style="animation-delay: ${animationDelay}s">
                <div class="card-header">
                    <video src="${item.video2d}" aria-label="${item.name}" autoplay loop muted playsinline></video>
                </div>
                <div class="card-body">
                    <h2 class="card-title">${item.name}</h2>
                    <p class="card-ingredients">${item.ingredients}</p>
                    
                    <div class="card-meta">
                        <div class="meta-badge">
                            <span class="meta-icon">⏱️</span> ${item.delay}
                        </div>
                        <div class="meta-badge">
                            <span class="meta-icon">🔥</span> ${item.calories}
                        </div>
                    </div>
                    
                    <div class="card-price">${item.price}</div>
                </div>
                <div class="card-footer">
                    <button class="btn-primary" data-model="${item.model3d}" onclick="openAR(this)">
                        <span class="spinner"></span>
                        <span class="btn-text">Ver en 3D</span>
                    </button>
                </div>
            </article>
        `;
        
        menuContainer.insertAdjacentHTML("beforeend", cardHTML);
    });
}

// Lógica de AR interactuando con el global model viewer
function openAR(button) {
    // Si ya está cargando, no hacer nada
    if (button.classList.contains("loading")) return;

    const modelUrl = button.getAttribute("data-model");
    const modelViewer = document.getElementById("global-model-viewer");
    
    // Si el modelo ya está cargado, no esperamos el evento 'load', disparamos de inmediato
    if (modelViewer.src && modelViewer.src.endsWith(modelUrl)) {
        try {
            modelViewer.activateAR();
        } catch (error) {
            console.error("No se pudo iniciar AR:", error);
            alert("No pudimos abrir la vista 3D. Tu dispositivo podría no ser compatible.");
        }
        return;
    }
    
    // 1. Mostrar estado de carga en el botón
    button.classList.add("loading");
    
    // Función para manejar cuando el modelo esté listo
    const onModelLoad = () => {
        // Remover el listener para no acumularlos
        modelViewer.removeEventListener("load", onModelLoad);
        
        // Quitar estado de carga
        button.classList.remove("loading");
        
        // 3. Forzar apertura de la cámara (Realidad Aumentada)
        // Nota: En iOS, si el evento 'load' tarda demasiado, Safari podría bloquear
        // el Quick Look por no ser un gesto síncrono del usuario. 
        // Sin embargo, esta es la lógica requerida.
        try {
            modelViewer.activateAR();
        } catch (error) {
            console.error("No se pudo iniciar AR:", error);
            alert("No pudimos abrir la vista 3D. Tu dispositivo podría no ser compatible.");
        }
    };

    // Agregar el listener
    modelViewer.addEventListener("load", onModelLoad);
    
    // 2. Cambiar el source del modelo para forzar la descarga
    modelViewer.src = modelUrl;
}

// Animación de Carga (Hero Cinematográfico)
function initWillemLoadingAnimation() {
  const container = document.querySelector(".willem-header");
  if(!container) return;
  
  const loadingLetter = container.querySelectorAll(".willem__letter");
  const box = container.querySelectorAll(".willem-loader__box");
  const growingImage = container.querySelectorAll(".willem__growing-image");
  const headingStart = container.querySelectorAll(".willem__h1-start");
  const headingEnd = container.querySelectorAll(".willem__h1-end");
  const coverImageExtra = container.querySelectorAll(".willem__cover-image-extra");
  const headerLetter = container.querySelectorAll(".willem__letter-white");
  const navLinks = container.querySelectorAll(".willen-nav .willem-nav__link, .osmo-credits__p");

  if (typeof gsap === 'undefined') return;

  gsap.set(headerLetter, { yPercent: 110 });
  gsap.set(navLinks, { yPercent: 110 });

  const tl = gsap.timeline({
    defaults: {
      ease: "expo.inOut",
    },
    onStart: () => {
      container.classList.remove("is--hidden");
    }
  });

  if (loadingLetter.length) {
    tl.from(loadingLetter, {
      yPercent: 100,
      stagger: 0.025,
      duration: 1.25
    });
  }

  if (box.length) {
    tl.fromTo(box, {
      width: "0em",
    },{
      width: "1em",
      duration: 1.25
    }, "< 1.25");
  }

  if (growingImage.length) {
    tl.fromTo(growingImage, {
      width: "0%",
    },{
      width: "100%",
      duration: 1.25
    }, "<");
  }

  if (headingStart.length) {
    tl.fromTo(headingStart, {
      x: "0em",
    },{
      x: "-0.05em",
      duration: 1.25
    }, "<");
  }

  if (headingEnd.length) {
    tl.fromTo(headingEnd, {
      x: "0em",
    },{
      x: "0.05em",
      duration: 1.25
    }, "<");
  }

  if (coverImageExtra.length) {
    tl.fromTo(coverImageExtra, {
      opacity: 1,
    },{
      opacity: 0,
      duration: 0.05,
      ease: "none",
      stagger: 0.5
    }, "-=0.05");
  }

  if (growingImage.length) {
    tl.to(growingImage, {
      width: "102vw",
      height: "102dvh",
      duration: 2
    }, "< 1.25");
  }

  if (box.length) {
    tl.to(box, {
      width: "115vw",
      duration: 2
    }, "<");
  }

  if (headerLetter.length) {
    tl.to(headerLetter, {
      yPercent: 0,
      duration: 1.25,
      ease: "expo.out",
      stagger: 0.025
    }, "< 1.2");
  }

  if (navLinks.length) {
    tl.to(navLinks, {
      yPercent: 0,
      duration: 1.25,
      ease: "expo.out",
      stagger: 0.1
    }, "<");
  }
}
