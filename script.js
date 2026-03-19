document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".content-section");
  const buttons = document.querySelectorAll(".nav-btn");

  function mostrar(id) {
    sections.forEach(section => {
      const isActive = section.id === id;
      section.classList.toggle("active", isActive);
    });

    buttons.forEach(button => {
      const target = button.dataset.section;
      button.classList.toggle("active", target === id);
    });

    const activeSection = document.getElementById(id);
    if (activeSection) {
      activeSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const target = button.dataset.section;
      mostrar(target);
    });
  });


  window.mostrar = mostrar;
});