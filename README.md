# INSTITUTO TECNOLÓGICO DE PACHUCA
## Materia: Graficación
## Examen 2do Seguimiento
### Fecha: 15 de Marzo 2026
## Autores: 
- Huerta Aguilar José Antonio 2300848
- Sánchez Ortega Adrián 23200899

#
## Contexto:
El presente proyecto consiste en el desarrollo de un videojuego interactivo en 2D implementado mediante HTML, CSS y JavaScript, además del apoyo de Bootstrap para el diseño, con renderizado en canvas. El sistema simula un entorno dinámico donde múltiples objetos (que son las pelotas de tenis) se desplazan dentro del área de juego (el canvas) siguiendo distintos patrones de movimiento: linear, diagonal y circular.

El enfoque principal del proyecto se centra en la implementación de lógica de colisiones entre objetos, pero también en la interacción con el usuario en tiempo real y control de comportamiento dinámico de los elementos en pantalla. Además, se incorporan elementos visuales y auditivos que enriquecen la experiencia del usuario al simular un videojuego real, como animaciones, retroalimentación visual y efectos de sonido.

## Objetivo
Desarrollar un videojuego interactivo que permita simular el movimiento y colisión de múltiples objetos en un entorno 2D, donde el usuario pueda interactuar eliminando objetos mediante clics, mientras el sistema ajusta dinámicamente la dificultad en función del desempeño del jugador, y además tiene el control de aparición de los objetos.

## Justificación
El desarrollo del presente videojuego tiene como finalidad aplicar los principios de la Programación Orientada a Objetos (POO) en el contexto de la graficación 2D, utilizando un entorno interactivo que permita modelar y controlar el comportamiento de múltiples objetos en pantalla.

Uno de los ejes principales del proyecto es el análisis y aplicación de las colisiones entre objetos desde su definición matemática. Para ello, se emplea una aproximación basada en geometría circular, donde cada objeto es representado mediante un radio de colisión y su posición central, permitiendo determinar interacciones físicas a partir del cálculo de distancias entre centros. Este enfoque facilita la implementación de reglas coherentes para el rebote y la separación de objetos, garantizando un comportamiento consistente dentro del sistema.

Adicionalmente, el uso de la POO permite estructurar el sistema de manera modular, encapsulando atributos y comportamientos dentro de clases que representan a cada objeto del entorno. Esto no solo mejora la organización del código, sino que también facilita la extensión y modificación del sistema, como la incorporación de distintos tipos de movimiento y dinámicas de interacción.

Finalmente, el proyecto integra estos conceptos en una interfaz gráfica interactiva que permite la participación directa del usuario mediante eventos de entrada, como el uso del mouse. De esta forma, se aprovechan los recursos disponibles en tecnologías web para construir una aplicación que combina fundamentos matemáticos, estructuración orientada a objetos e interacción en tiempo real, logrando una experiencia funcional y didáctica.

## Operación del videojuego
El videojuego consiste en un entorno donde múltiples pelotas de tenis se desplazan continuamente dentro del área visible del canvas. Cada pelota puede presentar uno de los siguientes tipos de movimiento:
-   Movimiento lineal
-   Movimiento diagonal
-   Movimiento circular

El usuario interactúa con el sistema mediante el mouse, haciendo clic sobre las pelotas con el objetivo de eliminarlas. Cada vez que una pelota es eliminada:

-   Se incrementa el contador de eliminaciones.
-   Se genera un efecto de sonido de impacto.
-   Se reemplaza automáticamente la pelota para mantener un número constante de objetos en pantalla.

El sistema incorpora un incremento de dificultad basado en el número de eliminaciones realizadas. A medida que el usuario elimina más pelotas, la velocidad de movimiento de los objetos aumenta, lo cual se refleja en tres modos de operación:

-   Modo Inicial
-   Modo Medio
-   Modo Alto

Y también existe interacción entre objetos, esto es cuando dos pelotas colisionan, por lo que:

-   Se detecta la colisión con base en la distancia entre sus centros.
-   Se calcula una dirección de rebote utilizando el vector normal entre los objetos.
-   Ambos objetos se separan para evitar superposición.
-   Los objetos pierden su comportamiento original y adoptan un movimiento lineal posterior a la colisión, simulando la colisión.

Además, el sistema incluye elementos visuales como resaltado al pasar el cursor sobre los objetos para indicar que esta dentro del área de cliqueado y un contador dinámico de eliminaciones, así como música de fondo que acompaña la interacción.

## Conclusiones
Durante el desarrollo del videojuego se enfrentaron diversos retos relacionados principalmente con la implementación de la lógica física y el comportamiento dinámico de los objetos:
- Uno de los aspectos más complejos fue la definición de reglas físicas adecuadas para el manejo de colisiones, ya que inicialmente, los objetos conservaban su tipo de movimiento original incluso después de colisionar, lo cual generaba comportamientos inconsistentes, especialmente en aquellos con movimiento circular. Esto provocaba que algunos objetos se quedaran “atorados” o presentaran trayectorias incorrectas. La solución consistió en redefinir la lógica de colisión para que, después del impacto, los objetos adoptaran un movimiento lineal basado en la dirección del choque.

- Otro reto importante fue asegurar que las colisiones se calcularan correctamente con respecto al centro de los objetos. Al trabajar con sprites visuales que no necesariamente representaban la geometría real de colisión, fue necesario implementar una aproximación mediante radios y calcular la distancia entre centros, lo que nos permitió mantener consistencia en la detección, aunque requirió ajustes finos para evitar errores como superposición o rebotes incorrectos.

Asimismo, se presentaron dificultades para evitar colisiones múltiples en un mismo instante entre los mismos objetos, lo que generaba comportamientos erráticos. Esto se resolvió mediante la implementación de un sistema de “enfriamiento” de colisión, el cual limita temporalmente la interacción entre dos objetos después de un impacto, para que no se acumulen todos en un mismo tiempo, aunque esto puede hacer que después de eliminar un objeto se están recargando todos.

Además, otro problema fue el manejo de audios, ya que el navegador evitaba que se reprodujeran automáticamente, lo cual, se solucionó implementando un botón de inicio, así, pedimos una acción y se carga todo el juego junto con la reproducción de los audios.

Finalmente, la integración de distintos tipos de movimiento (lineal, diagonal y circular) implicó un reto adicional, ya que cada uno requiere una lógica diferente. Especialmente el movimiento circular, que depende de un centro de rotación, requirió ajustes específicos para evitar conflictos con el sistema de colisiones.

En conjunto, el videojuego permitió comprender la complejidad que implica simular comportamientos físicosen entornos interactivos, ya que salimos del movimiento lineal, así como la importancia de definir reglas claras y consistentes para garantizar un funcionamiento estable y coherente del sistema, principalmente en las físicas, pero, se siguió considerando la POO, al editar las clases que se habían trabajado anteriormente, y adaptando a estas nuevas reglas, y, manteniendo un diseño agradable y responsive para el usuario.
