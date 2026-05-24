# Tecnicatura Superior en Desarrollo de Software  
## PP4 - Proyecto Integrador: Sistema de Gestión Integral TecnoFlow v1.0  


**Materia:** PP4 - Proyecto Integrador  
**Profesores:** Emir Eliezer Garcia Ontiveros y Kevin Axel Del Bello  
**Grupo:** Tecnova  
**Comisión:** A  
**Fecha:** 17-05-2026 

---

## Índice

1. [Introducción del Proyecto](#1-introducción-del-proyecto)  
   1.1 [Contexto del Rubro Juguetería](#11-contexto-del-rubro-juguetería)  
   1.2 [Problemáticas Detectadas](#12-problemáticas-detectadas)  
      1.2.1 [Situación Actual](#121-situación-actual)  
      1.2.2 [Problemas Identificados](#122-problemas-identificados)  
      1.2.3 [Necesidad del Sistema](#123-necesidad-del-sistema)  
      1.2.4 [Oportunidad de Mejora](#124-oportunidad-de-mejora)  
   1.3 [Propósito del Sistema](#13-propósito-del-sistema)  
   1.4 [Descripción General de la Solución](#14-descripción-general-de-la-solución)  
   1.5 [Descripción del Cliente Objetivo](#15-descripción-del-cliente-objetivo)  
   1.6 [Usuarios Objetivo](#16-usuarios-objetivo)  
      1.6.1 [Usuario Principal](#161-usuario-principal)  
      1.6.2 [Otros Usuarios del Sistema](#162-otros-usuarios-del-sistema)  
   1.7 [Objetivos del Proyecto](#17-objetivos-del-proyecto)  
      1.7.1 [Objetivo General](#171-objetivo-general)  
      1.7.2 [Objetivos Específicos](#172-objetivos-específicos)  
   1.8 [Estudio de Viabilidad](#18-estudio-de-viabilidad)  
      1.8.1 [Viabilidad Técnica](#181-viabilidad-técnica)  
      1.8.2 [Viabilidad Económica](#182-viabilidad-económica)  
      1.8.3 [Viabilidad Operativa](#183-viabilidad-operativa)  
   1.9 [Análisis de Competencia](#19-análisis-de-competencia)  
   1.10 [Selección del Tipo de Proyecto](#110-selección-del-tipo-de-proyecto)  
   1.11 [Caso Ficticio de Implementación: Planeta Juguete](#111-caso-ficticio-de-implementación-planeta-juguete)  
   1.12 [Alcance del Proyecto](#112-alcance-del-proyecto)  

2. [Arquitectura y Tecnologías del Sistema](#2-arquitectura-y-tecnologías-del-sistema)  
   2.1 [Introducción Arquitectónica](#21-introducción-arquitectónica)  
   2.2 [Stack Tecnológico](#22-stack-tecnológico)  
   2.3 [Arquitectura MVC](#23-arquitectura-mvc)  
   2.4 [Arquitectura de Seguridad](#24-arquitectura-de-seguridad)  
   2.5 [Arquitectura de Testing](#25-arquitectura-de-testing)  
   2.6 [Estructura y Organización de Carpetas](#26-estructura-y-organización-de-carpetas)  
   2.7 [Modelo de Datos y Persistencia](#27-modelo-de-datos-y-persistencia)  
   2.8 [Entidades Principales del Sistema](#28-entidades-principales-del-sistema)  
   2.9 [Interacción entre Capas](#29-interacción-entre-capas)  
   2.10 [Flujos Operacionales](#210-flujos-operacionales)  
      2.10.1 [Flujo de Lectura](#2101-flujo-de-lectura)  
      2.10.2 [Flujo de Escritura](#2102-flujo-de-escritura)  
      2.10.3 [Flujo de Autenticación](#2103-flujo-de-autenticación)  
      2.10.4 [Flujo de Autorización](#2104-flujo-de-autorización)  

3. [Módulos Funcionales del Sistema](#3-módulos-funcionales-del-sistema)  
   3.1 [Módulo POS (Punto de Venta)](#31-módulo-pos-punto-de-venta)  
   3.2 [Módulo de Inventario](#32-módulo-de-inventario)  
   3.3 [Módulo de Productos](#33-módulo-de-productos)  
   3.4 [Módulo de Proveedores](#34-módulo-de-proveedores)  
   3.5 [Módulo de Facturación](#35-módulo-de-facturación)  
   3.6 [Módulo de Usuarios y Roles](#36-módulo-de-usuarios-y-roles)  
   3.7 [Módulo de Dashboards y Reportes](#37-módulo-de-dashboards-y-reportes)  
   3.8 [Sistema de Alertas y Control de Stock](#38-sistema-de-alertas-y-control-de-stock)  

4. [Implementación de la Lógica de Negocio](#4-implementación-de-la-lógica-de-negocio)  
   4.1 [Actualización Automática de Stock](#41-actualización-automática-de-stock)  
   4.2 [Gestión de Reposición](#42-gestión-de-reposición)  
   4.3 [Validaciones del Sistema](#43-validaciones-del-sistema)  
   4.4 [Control de Permisos](#44-control-de-permisos)  
   4.5 [Generación de Reportes](#45-generación-de-reportes)  

5. [Documentación de Interfaces y Funcionalidades](#5-documentación-de-interfaces-y-funcionalidades)  
   5.1 [Menú y Navegación General](#51-menú-y-navegación-general)  
   5.2 [Patrón CRUD General](#52-patrón-crud-general)  
   5.3 [Casos Especiales por Módulo](#53-casos-especiales-por-módulo)  
      5.3.1 [Usuarios y Empleados](#531-usuarios-y-empleados)  
      5.3.2 [Roles y Permisos](#532-roles-y-permisos)  
      5.3.3 [Productos y Clasificación por Categorías](#533-productos-y-clasificación-por-categorías)  
      5.3.4 [Inventario y Movimientos de Stock](#534-inventario-y-movimientos-de-stock)  
      5.3.5 [Facturación y Ventas](#535-facturación-y-ventas)  
      5.3.6 [Alertas de Reposición](#536-alertas-de-reposición)  
      5.3.7 [Reportes Comerciales](#537-reportes-comerciales)  
   5.4 [Interfaces de Dashboards y Reportes](#54-interfaces-de-dashboards-y-reportes)  

6. [Sistema de Autenticación y Seguridad](#6-sistema-de-autenticación-y-seguridad)  
   6.1 [Características Generales](#61-características-generales)  
   6.2 [Autenticación](#62-autenticación)  
   6.3 [Autorización](#63-autorización)  
   6.4 [Roles Temporales](#64-roles-temporales)  
   6.5 [Protección de Rutas](#65-protección-de-rutas)  
   6.6 [Buenas Prácticas de Seguridad](#66-buenas-prácticas-de-seguridad)  

7. [Sistema de Testing](#7-sistema-de-testing)  
   7.1 [Testing con TDD](#71-testing-con-tdd)  
   7.2 [Stack de Testing](#72-stack-de-testing)  
   7.3 [Comandos Disponibles](#73-comandos-disponibles)  
   7.4 [Tests Implementados](#74-tests-implementados)  
   7.5 [Cobertura y Validaciones](#75-cobertura-y-validaciones)  

8. [Cómo Ejecutar el Proyecto](#8-cómo-ejecutar-el-proyecto)  
   8.1 [Clonar el Repositorio](#81-clonar-el-repositorio)  
   8.2 [Instalar Dependencias](#82-instalar-dependencias)  
   8.3 [Configurar MongoDB](#83-configurar-mongodb)  
   8.4 [Variables de Entorno](#84-variables-de-entorno)  
   8.5 [Ejecutar la Aplicación](#85-ejecutar-la-aplicación)  
   8.6 [Acceder desde el Navegador](#86-acceder-desde-el-navegador)  

9. [Uso de Inteligencia Artificial](#9-uso-de-inteligencia-artificial)  
   9.1 [Herramientas Utilizadas](#91-herramientas-utilizadas)  
   9.2 [Asistencia en el Desarrollo](#92-asistencia-en-el-desarrollo)  
   9.3 [Generación de Documentación y Testing](#93-generación-de-documentación-y-testing)  

10. [Conclusión Final](#10-conclusión-final)  

11. [Bibliografía y Fuentes](#11-bibliografía-y-fuentes)

<br>

--- 

# 1. Introducción del Proyecto

El sistema **TecnoFlow v3.0** es una plataforma web integral de gestión comercial orientada al sector de jugueterías y comercios minoristas. La solución unifica en una sola herramienta las funcionalidades de **POS (Point of Sale / Punto de Venta)**, **ERP (Enterprise Resource Planning / Planificación de Recursos Empresariales)** y **Gestión de Inventario**, con el objetivo de centralizar y optimizar las operaciones diarias del negocio.

El módulo de **POS** se enfoca en agilizar la atención en el punto de venta mediante el registro rápido de transacciones, la facturación y el control de caja, garantizando una operación comercial eficiente y precisa. Por su parte, el componente **ERP** permite gestionar información clave del negocio, como proveedores, costos de reposición y datos operativos, facilitando la administración interna y el soporte a la toma de decisiones. Finalmente, el módulo de **Gestión de Inventario** proporciona un control detallado de la mercadería disponible, permitiendo su clasificación por categorías, el seguimiento de stock en tiempo real y la generación de alertas automáticas de reposición.

Para fines de desarrollo y validación funcional, el sistema incorpora el caso ficticio de la juguetería **Planeta Juguete**, utilizado como escenario de referencia para simular operaciones comerciales reales dentro del rubro.

En conjunto, **TecnoFlow v3.0** reemplaza procesos manuales y herramientas aisladas por una plataforma unificada, orientada a mejorar la eficiencia operativa, reducir errores y proporcionar información confiable para la gestión del negocio.


## 1.1 Contexto del Rubro Juguetería

El rubro de jugueterías se caracteriza por ser un sector minorista con alta diversidad de productos, fuerte estacionalidad y una rotación de inventario variable según períodos del año. Los comercios de este tipo gestionan artículos que abarcan distintas categorías, edades recomendadas y líneas de productos, lo que incrementa la complejidad del control operativo en comparación con otros rubros minoristas más homogéneos.

Entre las particularidades más relevantes del sector se encuentra la alta dependencia de temporadas comerciales específicas, como el Día del Niño, Navidad y reyes, donde se concentran gran parte de las ventas anuales. Esta estacionalidad exige una planificación cuidadosa del stock, la reposición y la estrategia de precios.

Asimismo, las jugueterías suelen manejar múltiples proveedores y una amplia variedad de productos con diferentes ciclos de vida comercial. Esto genera la necesidad de contar con sistemas que permitan un seguimiento preciso del inventario, así como herramientas que faciliten la organización por categorías, marcas y rangos etarios.

En muchos casos, especialmente en pequeños y medianos comercios, la gestión operativa se realiza mediante métodos manuales o herramientas básicas no integradas, como planillas o registros aislados. Esta situación dificulta la obtención de información en tiempo real, incrementa el riesgo de errores en el control de stock y limita la capacidad de análisis del negocio.

En este contexto, se vuelve necesario implementar soluciones tecnológicas integradas que permitan centralizar la operación comercial, optimizar el control de inventario y mejorar la eficiencia en los procesos de venta y administración.

## 1.2 Problemáticas Detectadas

En el análisis del rubro de jugueterías se identifican diversas limitaciones operativas asociadas principalmente a la gestión manual o semi-manual de los procesos comerciales. Estas problemáticas afectan directamente la eficiencia del negocio, la precisión de la información y la capacidad de toma de decisiones.

### 1.2.1 Situación Actual

Actualmente, muchos comercios del sector juguetería gestionan sus operaciones mediante herramientas no integradas, como planillas de cálculo o registros manuales. Si bien estas soluciones pueden ser suficientes en etapas iniciales del negocio, resultan limitadas cuando aumenta el volumen de productos, la cantidad de transacciones y la complejidad del inventario.

El registro de ventas, el control de stock y la gestión de proveedores suelen encontrarse desacoplados, lo que provoca inconsistencias en la información disponible y dificulta la actualización en tiempo real de los datos operativos.

### 1.2.2 Problemas Identificados

A partir del análisis de la situación actual, se identifican los siguientes problemas principales:

- Falta de control preciso del inventario en tiempo real.  
- Errores en el registro manual de ventas y movimientos de stock.  
- Dificultad para identificar productos con bajo stock o alta rotación.  
- Ausencia de integración entre ventas, inventario y proveedores.  
- Limitaciones en la generación de reportes confiables para la toma de decisiones.  
- Organización ineficiente de productos por categorías, marcas o rangos etarios.  
- Dependencia de procesos manuales que incrementan el tiempo operativo.

### 1.2.3 Necesidad del Sistema

Frente a las problemáticas identificadas, se evidencia la necesidad de implementar un sistema de gestión integral que permita centralizar y automatizar los procesos del negocio.

El sistema debe permitir la actualización en tiempo real del inventario a partir de las ventas, facilitar el registro de operaciones comerciales mediante un punto de venta (POS) y optimizar la gestión de información relacionada con productos y proveedores.

Asimismo, se requiere una plataforma que proporcione información estructurada y confiable para la toma de decisiones, reduciendo la dependencia de procesos manuales y mejorando la eficiencia operativa general.

### 1.2.4 Oportunidad de Mejora

La implementación de un sistema integrado representa una oportunidad significativa para mejorar la gestión de los comercios del rubro juguetería.

La centralización de la información permite reducir errores operativos, optimizar el control de stock y mejorar la velocidad de respuesta ante cambios en la demanda. Además, la incorporación de herramientas de análisis facilita la identificación de productos de alta rotación, la planificación de reposición y la toma de decisiones estratégicas basadas en datos.

En este contexto, una solución como TecnoFlow v3.0 permite evolucionar desde un modelo operativo fragmentado hacia un entorno digital integrado, más eficiente y escalable.

## 1.3 Propósito del Sistema

El propósito del sistema **TecnoFlow v3.0** es desarrollar una plataforma web de gestión integral orientada a comercios del rubro juguetería, con el objetivo de centralizar y optimizar los procesos operativos del negocio.

La solución está diseñada para integrar en un único entorno funcional los procesos de ventas mediante punto de venta (POS), la administración del inventario y la gestión de información comercial relacionada con productos y proveedores. Esta integración permite reducir la fragmentación de herramientas y mejorar la coherencia de los datos operativos.

El sistema busca mejorar el control del inventario en tiempo real, automatizar la actualización de stock a partir de las ventas y facilitar la gestión eficiente de los productos disponibles. Asimismo, proporciona herramientas que permiten registrar operaciones comerciales de forma ágil y estructurada.

Adicionalmente, la plataforma está orientada a mejorar la calidad de la información disponible para la toma de decisiones, permitiendo a los usuarios acceder a datos actualizados sobre ventas, stock y comportamiento del negocio.

En términos generales, el sistema tiene como finalidad reemplazar procesos manuales o dispersos por una solución digital integrada, reduciendo errores operativos y mejorando la eficiencia en la gestión del comercio.

## 1.4 Descripción General de la Solución

La solución propuesta se basa en el desarrollo de una plataforma web de gestión integral orientada a comercios del rubro juguetería, diseñada para centralizar y optimizar los procesos operativos del negocio.

El sistema se estructura en módulos funcionales interrelacionados que permiten gestionar de manera unificada las operaciones principales del comercio. Estos módulos incluyen el Punto de Venta (POS), la gestión de inventario y la administración de productos y proveedores, garantizando la consistencia de la información en toda la plataforma.

Desde el punto de vista funcional, el módulo de POS permite registrar ventas de manera rápida, actualizar automáticamente el stock y gestionar el flujo de caja. El módulo de inventario proporciona visibilidad en tiempo real de la disponibilidad de productos, facilitando su organización por categorías, marcas y atributos relevantes como rangos etarios. Por su parte, el módulo de gestión permite administrar información clave del negocio, como proveedores, precios y datos asociados a la reposición de mercadería.

El sistema también incorpora funcionalidades de apoyo a la toma de decisiones, mediante la generación de reportes y estadísticas operativas, que permiten analizar el comportamiento de ventas, identificar productos de alta rotación y detectar necesidades de reposición.

En términos arquitectónicos, la solución se basa en una estructura modular que separa la lógica de negocio, la capa de datos y la interfaz de usuario, lo que favorece la escalabilidad, el mantenimiento y la evolución futura del sistema.

En conjunto, la plataforma busca unificar procesos dispersos en una única herramienta digital, mejorando la eficiencia operativa y la calidad de la información disponible para la gestión del negocio.

## 1.5 Descripción del Cliente Objetivo

El sistema está orientado a pequeños y medianos comercios del rubro juguetería que requieren una solución digital para la gestión integral de sus operaciones diarias. Este tipo de negocios suele caracterizarse por manejar un volumen variable de productos, con alta diversidad de categorías y una rotación de inventario influenciada por factores estacionales.

En general, estos comercios gestionan productos como juguetes didácticos, recreativos, juegos de mesa y artículos infantiles en distintas franjas etarias, lo que incrementa la complejidad del control de stock y la organización del inventario. Además, suelen trabajar con múltiples proveedores, lo que exige un seguimiento eficiente de compras, reposición y costos asociados.

En muchos casos, la gestión del negocio se realiza mediante herramientas básicas o procesos manuales, como planillas de cálculo o registros no integrados. Esta situación limita la disponibilidad de información en tiempo real, dificulta el control preciso del inventario y aumenta el riesgo de errores operativos.

El cliente objetivo, en términos de perfil, corresponde principalmente al dueño o encargado del comercio. Se trata de usuarios con bajo o medio nivel técnico, que requieren sistemas simples, intuitivos y enfocados en la eficiencia operativa. Sus necesidades principales incluyen el control del stock, el registro ágil de ventas, el seguimiento de productos y la obtención de información clara para la toma de decisiones.

En este contexto, el sistema busca adaptarse a las necesidades reales del sector, priorizando la facilidad de uso, la centralización de la información y la reducción de tareas manuales.

## 1.6 Usuarios Objetivo

El sistema define distintos perfiles de usuarios según sus responsabilidades dentro del comercio, con el objetivo de adaptar el acceso y las funcionalidades disponibles a cada rol operativo.

### 1.6.1 Usuario Principal

El usuario principal del sistema corresponde al dueño o encargado del comercio. Este perfil es el responsable de la gestión general del negocio y utiliza la plataforma como herramienta central para el control operativo.

Sus principales responsabilidades incluyen la supervisión del inventario, el análisis de ventas, la gestión de proveedores y la toma de decisiones basadas en la información generada por el sistema.

Este tipo de usuario requiere una interfaz clara, accesible y orientada a la eficiencia, ya que en la mayoría de los casos no cuenta con conocimientos técnicos avanzados. Sus necesidades principales se centran en el control del stock en tiempo real, la visualización de reportes y la administración general del negocio.

### 1.6.2 Otros Usuarios del Sistema

Además del usuario principal, el sistema contempla otros perfiles operativos con acceso limitado según sus funciones:

- **Empleados / Vendedores:** encargados de registrar ventas en el sistema POS, consultar disponibilidad de productos y asistir en la atención al cliente. Su interacción se centra principalmente en el punto de venta y la operación diaria.

- **Administradores del sistema:** responsables de la configuración general de la plataforma, la gestión de usuarios, roles y permisos, así como la supervisión del correcto funcionamiento del sistema.

Cada perfil cuenta con niveles de acceso diferenciados, lo que permite mantener la seguridad de la información y garantizar una correcta distribución de responsabilidades dentro del sistema.

## 1.7 Objetivos del Proyecto

Los objetivos del proyecto definen los resultados que se esperan alcanzar con el desarrollo del sistema **TecnoFlow v3.0**, estableciendo una guía clara para su diseño, implementación y validación funcional.

### 1.7.1 Objetivo General

Desarrollar un sistema web de gestión integral para comercios del rubro juguetería que permita centralizar las operaciones de venta, inventario y administración de productos, con el fin de mejorar la eficiencia operativa, reducir errores manuales y facilitar la toma de decisiones basada en datos.

### 1.7.2 Objetivos Específicos

- Implementar un módulo de Punto de Venta (POS) que permita registrar ventas de manera rápida, actualizando automáticamente el inventario.  
- Desarrollar un sistema de gestión de inventario que permita controlar el stock en tiempo real y organizar los productos por categorías y atributos relevantes.  
- Incorporar la administración de productos y proveedores para optimizar la reposición y el control de costos.  
- Garantizar la sincronización entre ventas e inventario para mantener la consistencia de los datos operativos.  
- Diseñar un sistema de reportes y estadísticas que permita analizar ventas, stock y rotación de productos.  
- Implementar una interfaz de usuario intuitiva y accesible, orientada a usuarios con bajo nivel técnico.  
- Incorporar mecanismos de alertas para productos con bajo stock, facilitando la reposición oportuna.  
- Asegurar que el sistema sea accesible desde distintos dispositivos mediante una arquitectura web responsiva.

## 1.8 Estudio de Viabilidad

El estudio de viabilidad analiza la factibilidad del desarrollo del sistema **TecnoFlow v3.0** desde distintas perspectivas, considerando aspectos técnicos, económicos y operativos para determinar su implementación dentro del contexto de comercios del rubro juguetería.

### 1.8.1 Viabilidad Técnica

Desde el punto de vista técnico, el desarrollo del sistema es viable debido al uso de tecnologías modernas ampliamente adoptadas en el desarrollo de aplicaciones web.

El sistema puede implementarse utilizando tecnologías como Node.js y Express para el backend, junto con una base de datos MongoDB para el almacenamiento de información relacionada con productos, ventas, usuarios y proveedores. En el frontend, tecnologías como HTML, CSS y JavaScript permiten construir interfaces dinámicas y responsivas.

Adicionalmente, el uso de una arquitectura modular basada en el patrón MVC (Model-View-Controller) facilita la organización del código, la escalabilidad del sistema y su mantenimiento a largo plazo. La disponibilidad de documentación, comunidad activa y herramientas de desarrollo consolidadas reduce significativamente los riesgos técnicos del proyecto.

### 1.8.2 Viabilidad Económica

Desde el punto de vista económico, el proyecto presenta una alta viabilidad debido al uso de tecnologías open source y herramientas sin costos de licencia.

Las tecnologías utilizadas no requieren inversiones iniciales significativas, lo que permite desarrollar el sistema con recursos informáticos estándar. Los principales costos asociados se relacionan con el tiempo de desarrollo, mantenimiento y eventual despliegue en servidores.

En consecuencia, el sistema resulta accesible para pequeños y medianos comercios, alineándose con el objetivo de ofrecer una solución de bajo costo y alto impacto operativo.

### 1.8.3 Viabilidad Operativa

Desde la perspectiva operativa, el sistema es viable debido a su alineación con las necesidades reales del usuario final, principalmente comerciantes y encargados de jugueterías.

La interfaz está diseñada para ser simple e intuitiva, permitiendo su uso sin requerimientos de conocimientos técnicos avanzados. La centralización de los procesos en una única plataforma reduce la complejidad operativa y mejora la adopción del sistema.

Asimismo, la implementación progresiva de funcionalidades facilita la transición desde métodos tradicionales hacia una gestión digitalizada, reduciendo la resistencia al cambio y mejorando la eficiencia en el uso diario del sistema.

## 1.9 Análisis de Competencia

En el mercado actual existen diversas soluciones orientadas a la gestión comercial y el control de inventario para comercios minoristas. Estas herramientas suelen presentarse como sistemas POS (Point of Sale), plataformas de comercio electrónico o sistemas ERP genéricos, con funcionalidades amplias para distintos tipos de negocios.

Entre las soluciones más utilizadas se encuentran sistemas POS y plataformas de gestión comercial que permiten registrar ventas, administrar productos y generar reportes básicos. Algunas de estas herramientas incluyen servicios como Shopify, Tiendanube o sistemas ERP más generales utilizados en pequeñas y medianas empresas.

Si bien estas soluciones ofrecen funcionalidades robustas, en muchos casos no están específicamente adaptadas a las particularidades del rubro juguetería. Aspectos como la clasificación de productos por rangos etarios, la estacionalidad de la demanda o la gestión detallada de reposición de stock no siempre se encuentran profundamente integrados o requieren configuraciones adicionales.

Adicionalmente, muchas de estas plataformas operan bajo modelos de suscripción que pueden resultar costosos para pequeños y medianos comercios, o bien presentan una complejidad funcional que excede las necesidades reales del usuario final.

El sistema **TecnoFlow v3.0** se diferencia al proponer una solución más específica y orientada al rubro juguetería, integrando de forma directa funcionalidades de POS, inventario y gestión operativa en una única plataforma. Su enfoque está centrado en la simplicidad, la eficiencia operativa y la adaptación a procesos concretos del negocio minorista, priorizando la usabilidad por sobre la complejidad empresarial.

## 1.10 Selección del Tipo de Proyecto

El presente proyecto se clasifica como el desarrollo de una aplicación web de gestión orientada al ámbito comercial, específicamente enfocada en el rubro de jugueterías y comercios minoristas.

Se trata de un sistema de información que tiene como objetivo principal centralizar y optimizar procesos operativos del negocio, tales como la gestión de ventas, el control de inventario y la administración de productos y proveedores. En este sentido, el sistema se encuadra dentro de las soluciones de tipo POS (Point of Sale), complementadas con funcionalidades de gestión tipo ERP y control de stock.

La decisión de implementar una aplicación web responde a la necesidad de accesibilidad y flexibilidad, permitiendo el uso del sistema desde distintos dispositivos sin requerir instalaciones locales complejas. Esto resulta especialmente adecuado para pequeños y medianos comercios, donde se prioriza la facilidad de uso y la disponibilidad inmediata de la información.

Asimismo, la arquitectura web facilita la escalabilidad del sistema, permitiendo futuras ampliaciones funcionales como la incorporación de nuevos módulos, integraciones externas o mejoras en el análisis de datos.

En conclusión, se selecciona el desarrollo de una aplicación web de gestión debido a su viabilidad técnica, bajo costo de implementación y capacidad de adaptación a las necesidades específicas del sector comercial al que está dirigido.

## 1.11 Caso Ficticio de Implementación: Planeta Juguete

Para fines de desarrollo, prueba y validación funcional, el sistema **TecnoFlow v3.0** utiliza el caso ficticio de la juguetería **Planeta Juguete** como entorno de referencia.

Este escenario simula el funcionamiento real de un comercio del rubro juguetería, permitiendo modelar procesos habituales como la gestión de inventario, el registro de ventas mediante POS, la administración de productos y el control de proveedores. A través de este caso de uso, se reproducen situaciones operativas comunes del sector, como la reposición de stock, la clasificación de productos por categorías y rangos etarios, y el análisis de ventas según la rotación de mercadería.

El uso de un caso ficticio permite mantener la independencia del sistema respecto a un cliente real, al mismo tiempo que facilita el diseño de funcionalidades alineadas con escenarios concretos del negocio minorista. De esta manera, **Planeta Juguete** actúa como un modelo operativo que representa las necesidades típicas de una juguetería, sin limitar el sistema a un único contexto empresarial.

## 1.12 Alcance del Proyecto

En esta sección se define el alcance del sistema **TecnoFlow v3.0**, especificando sus objetivos, funcionalidades principales, tecnologías utilizadas y el perfil de usuarios destinatarios. Este alcance delimita con precisión qué incluye el sistema y cuáles son sus restricciones funcionales, estableciendo una base clara para su diseño e implementación.

### Objetivo del Software

El objetivo del sistema es desarrollar una plataforma web de gestión integral orientada a jugueterías, que permita administrar de manera eficiente el inventario, las ventas y la información de productos y proveedores, centralizando los procesos del negocio en una única solución.

El sistema está diseñado para optimizar las operaciones diarias del comercio, facilitando el control de stock en tiempo real, el registro de ventas mediante punto de venta (POS) y el acceso a información actualizada para la toma de decisiones.

Asimismo, se busca mejorar la organización de los productos mediante su clasificación por categorías y rangos etarios, permitiendo una gestión más estructurada del inventario y una mejor experiencia operativa.

El sistema incorpora además herramientas de análisis y generación de reportes que permiten identificar patrones de consumo, productos de mayor rotación y necesidades de reposición.

### Características Principales

El sistema se compone de módulos funcionales que permiten cubrir las principales necesidades operativas del comercio:

**Gestión de Inventario**  
Permite administrar productos de forma centralizada, incluyendo altas, bajas y modificaciones. Cada producto cuenta con atributos como nombre, categoría, precio, proveedor y rango etario. El stock se actualiza en tiempo real a partir de las ventas y se generan alertas automáticas cuando existen niveles bajos de inventario.

**Gestión de Ventas (POS)**  
Permite registrar transacciones comerciales de manera rápida, almacenando información como productos vendidos, cantidades, precios y fecha. La venta impacta automáticamente sobre el stock disponible.

**Gestión de Proveedores**  
Permite administrar la información de proveedores, incluyendo datos de contacto, productos asociados y control de costos de reposición.

**Reportes y Estadísticas**  
Proporciona herramientas de análisis sobre ventas, productos más vendidos, niveles de stock y rotación de inventario, con posibilidad de segmentación por categorías o rangos etarios.

**Control de Usuarios**  
Permite gestionar distintos perfiles de usuario con niveles de acceso diferenciados, garantizando seguridad y control sobre las operaciones del sistema.

### Plataformas y Tecnologías

El sistema se desarrolla como una aplicación web, lo que permite su acceso desde distintos dispositivos sin necesidad de instalación local.

**Backend**  
Se utiliza Node.js junto con Express.js para la implementación de la lógica del servidor y la construcción de una API (Application Programming Interface).

**Frontend**  
Se desarrolla con React, complementado con HTML, CSS y JavaScript para la construcción de interfaces dinámicas y responsivas.

**Base de Datos**  
Se utiliza MongoDB como base de datos NoSQL orientada a documentos, permitiendo flexibilidad en la estructura de la información.

**Infraestructura**  
El sistema puede desplegarse en entornos en la nube, garantizando escalabilidad, disponibilidad y acceso remoto.

**Control de Versiones**  
Se utiliza Git como sistema de control de versiones y GitHub como repositorio remoto para la gestión del código fuente.

### Usuarios Objetivo

El sistema está orientado a distintos perfiles de usuarios dentro de una juguetería:

- **Usuario principal (dueño o encargado):** responsable de la gestión general del negocio, acceso a reportes, inventario y administración del sistema.  
- **Empleados / vendedores:** encargados del registro de ventas y consulta de productos disponibles.  
- **Administradores del sistema:** responsables de la configuración del sistema, usuarios y permisos.

### Límites del Sistema

El sistema se enfoca exclusivamente en la gestión interna del comercio, por lo que no incluye funcionalidades de comercio electrónico como ventas online, carritos de compra o pasarelas de pago.

Tampoco contempla integración con sistemas contables externos ni aplicaciones móviles nativas en esta versión.

Asimismo, no incluye integración en tiempo real con proveedores mediante APIs externas, aunque estas pueden considerarse mejoras futuras del sistema.


---

# 2. Arquitectura y Tecnologías del Sistema

## 2.1 Introducción Arquitectónica

El sistema **TecnoFlow v3.0** se basa en una arquitectura moderna de tipo **cliente-servidor desacoplada**, implementada bajo el stack MERN (MongoDB, Express, React, Node.js). Este enfoque permite separar claramente la capa de presentación (frontend) de la lógica de negocio y persistencia (backend), facilitando escalabilidad, mantenimiento y evolución independiente de cada componente.

La arquitectura general se organiza en tres capas principales:

* **Frontend (React):** responsable de la interfaz de usuario y la experiencia interactiva.
* **Backend (Node.js + Express):** expone una API REST que gestiona la lógica de negocio.
* **Persistencia (MongoDB + Mongoose):** almacena y estructura los datos del sistema.

Este diseño reemplaza completamente cualquier enfoque basado en renderizado del lado del servidor, adoptando una comunicación basada en JSON a través de HTTP.

## 2.2 Stack Tecnológico

### Backend y API

| Componente           | Tecnología       | Propósito                           |
| -------------------- | ---------------- | ----------------------------------- |
| Entorno de ejecución | Node.js          | Plataforma del servidor             |
| Framework web        | Express.js       | Gestión de API REST y middleware    |
| Módulos              | ES Modules (ESM) | Importación moderna de dependencias |

### Persistencia y Datos

| Componente    | Tecnología    | Propósito                      |
| ------------- | ------------- | ------------------------------ |
| Base de datos | MongoDB       | Base de datos NoSQL documental |
| ODM           | Mongoose      | Modelado y validación de datos |
| Hosting       | MongoDB Atlas | Base de datos en la nube       |

### Autenticación y Seguridad

| Componente          | Tecnología               | Propósito               |
| ------------------- | ------------------------ | ----------------------- |
| Autenticación       | JSON Web Token (JWT)     | Sesiones stateless      |
| Hash de contraseñas | bcrypt                   | Cifrado de credenciales |
| Control de acceso   | Middleware personalizado | Roles y permisos        |

### Frontend

| Componente       | Tecnología    | Propósito               |
| ---------------- | ------------- | ----------------------- |
| Librería UI      | React         | Interfaz de usuario SPA |
| Router           | React Router  | Navegación interna      |
| Comunicación API | Fetch / Axios | Consumo de backend      |

### Testing y Calidad

| Componente   | Tecnología            | Propósito                       |
| ------------ | --------------------- | ------------------------------- |
| Testing      | Jest                  | Pruebas unitarias e integración |
| HTTP testing | Supertest             | Validación de endpoints         |
| Mock DB      | MongoDB Memory Server | Base de datos en memoria        |

### Infraestructura

| Componente           | Tecnología      | Propósito                        |
| -------------------- | --------------- | -------------------------------- |
| Control de versiones | Git / GitHub    | Gestión del código fuente        |
| Deployment           | Render / Vercel | Despliegue de frontend y backend |
| Base de datos cloud  | MongoDB Atlas   | Persistencia escalable           |


## 2.3 Arquitectura MVC (adaptada a API REST)

El sistema mantiene el patrón **MVC conceptual**, aunque adaptado a una arquitectura API desacoplada:

* **Model (Mongoose Models):** representan las entidades del dominio y reglas de persistencia.
* **Controller (Express Controllers):** contienen la lógica de negocio y orquestan operaciones.
* **View (React):** interfaz de usuario basada en componentes reutilizables.

A diferencia de sistemas tradicionales, la “vista” no se genera en el servidor, sino que React consume datos desde la API y los renderiza en el cliente.


## 2.4 Arquitectura de Seguridad

El sistema implementa una arquitectura de seguridad basada en capas:

### Autenticación

* Uso de **JSON Web Tokens (JWT)** para autenticación stateless.
* El backend emite tokens firmados con expiración controlada.
* El frontend almacena el token y lo envía en cada request.

### Autorización

* Sistema de **roles y permisos** basado en middleware.
* Validación en cada endpoint protegido.
* Control granular de acceso por recurso.

### Protección de datos

* Contraseñas cifradas con **bcrypt**.
* Validación de entrada en backend.
* Sanitización de datos recibidos desde el cliente.

## 2.5 Arquitectura de Testing

El sistema incorpora una estrategia de testing basada en tres niveles:

### Tests unitarios

Validan funciones aisladas de lógica de negocio y utilidades.

### Tests de integración

Validan interacción entre:

* Controladores
* Modelos
* Base de datos
* Endpoints REST

### Infraestructura de testing

* Base de datos en memoria (MongoDB Memory Server)
* Jest como framework principal
* Supertest para simulación de HTTP

El objetivo es asegurar consistencia del sistema sin depender de servicios externos.


## 2.6 Estructura y Organización de Carpetas

### Backend (Node.js + Express)

```
src/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── services/
 ├── utils/
 ├── config/
 └── app.js
```

### Frontend (React)

```
src/
 ├── components/
 ├── pages/
 ├── hooks/
 ├── services/
 ├── context/
 ├── routes/
 ├── pages/
 ├── App.jxx
 ├── main.jsx
 └── styles.css
```

Esta separación refuerza el desacoplamiento entre cliente y servidor.


## 2.7 Modelo de Datos y Persistencia

El modelo de datos está basado en **MongoDB con Mongoose**, utilizando esquemas documentales flexibles.

Características principales:

* Esquemas tipados mediante Mongoose.
* Relaciones mediante `ObjectId`.
* Uso de `populate` para referencias entre entidades.
* Validaciones a nivel de esquema.
* Campos automáticos de auditoría (`createdAt`, `updatedAt`).

El modelo está diseñado para soportar entidades como:

* Usuarios
* Productos
* Ventas
* Inventario
* Proveedores


## 2.8 Entidades Principales del Sistema

Las entidades principales del dominio incluyen:

* **User:** gestión de autenticación y roles.
* **Product:** información de productos y categorías.
* **Stock:** control de inventario en tiempo real.
* **Sale:** registro de ventas realizadas.
* **Supplier:** gestión de proveedores.
* **Category:** clasificación de productos.

Cada entidad está representada como un modelo de Mongoose y expuesta mediante endpoints REST.

## 2.9 Interacción entre Capas

El flujo de comunicación sigue un modelo API REST desacoplado:

1. El usuario interactúa con la interfaz React.
2. React realiza una solicitud HTTP al backend.
3. Express recibe la petición mediante una ruta definida.
4. El controlador ejecuta la lógica de negocio.
5. El modelo interactúa con MongoDB mediante Mongoose.
6. La respuesta se devuelve en formato JSON.
7. React actualiza la interfaz con los datos recibidos.

Este flujo elimina completamente el renderizado en servidor.

## 2.10 Flujos Operacionales

### 2.10.1 Flujo de Lectura

1. React solicita datos (GET request).
2. Backend consulta MongoDB.
3. Datos se devuelven en JSON.
4. React renderiza la información.

### 2.10.2 Flujo de Escritura

1. Usuario envía formulario en React.
2. Se realiza POST/PUT al backend.
3. Controlador valida datos.
4. Modelo guarda en MongoDB.
5. Respuesta confirmando operación.


### 2.10.3 Flujo de Autenticación

1. Usuario envía credenciales.
2. Backend valida usuario.
3. Se genera JWT.
4. Token se envía al frontend.
5. Se almacena para requests futuros.


### 2.10.4 Flujo de Autorización

1. Request incluye JWT.
2. Middleware valida token.
3. Se verifica rol/permisos.
4. Se permite o bloquea acceso.
5. Se ejecuta el controlador si es válido.

---

## 3. Módulos Funcionales del Sistema

El sistema está organizado en módulos funcionales independientes pero integrados, lo que permite una separación clara de responsabilidades y facilita el mantenimiento, la escalabilidad y la evolución del software. Cada módulo responde a un área específica de gestión del negocio, cubriendo las operaciones principales de una juguetería o comercio minorista.


### 3.1 Módulo POS (Punto de Venta)

El módulo de Punto de Venta (POS) es el núcleo operativo del sistema, encargado de registrar y procesar las ventas en tiempo real.

Permite buscar productos, agregarlos a un carrito de compra, calcular totales automáticamente y generar la transacción final. Cada venta se registra en la base de datos junto con la actualización inmediata del stock, garantizando consistencia entre ventas e inventario.

Este módulo está optimizado para velocidad de uso, ya que se utiliza en contextos de atención directa al cliente.


### 3.2 Módulo de Inventario

El módulo de inventario gestiona el control central de stock del sistema.

Permite visualizar el estado de todos los productos, sus cantidades disponibles, niveles mínimos y movimientos de entrada y salida. Cada modificación en el inventario se registra de forma trazable, ya sea por ventas, reposiciones o ajustes manuales.

Este módulo es clave para evitar quiebres de stock y mejorar la planificación de reposición.


### 3.3 Módulo de Productos

Este módulo se encarga de la administración del catálogo de productos del sistema.

Permite crear, editar, eliminar y consultar productos, incluyendo información como nombre, categoría, precio, proveedor asociado y rango etario. También soporta la clasificación por categorías para facilitar búsquedas y análisis.

El módulo está diseñado para mantener una estructura de datos consistente que alimente tanto el POS como el inventario.


### 3.4 Módulo de Proveedores

El módulo de proveedores centraliza la gestión de los abastecedores del negocio.

Permite registrar proveedores, almacenar datos de contacto y asociarlos a productos específicos. También facilita el seguimiento de relaciones comerciales, historiales de compra y costos de reposición.

Este módulo es fundamental para la planificación de compras y control de costos operativos.

### 3.5 Módulo de Facturación

El módulo de facturación gestiona la generación y registro de comprobantes de venta.

Cada factura se crea a partir de una venta confirmada e incluye detalles como productos, cantidades, precios, impuestos y totales. Las facturas quedan almacenadas en el sistema para su consulta histórica y análisis financiero.

Este módulo asegura trazabilidad completa de las operaciones comerciales.

### 3.6 Módulo de Usuarios y Roles

Este módulo controla el acceso al sistema mediante autenticación y autorización basada en roles.

Cada usuario posee credenciales seguras y un rol asignado que determina sus permisos dentro del sistema. Los roles permiten restringir o habilitar acciones como gestionar productos, realizar ventas o acceder a reportes.

Este enfoque mejora la seguridad y evita accesos no autorizados a información sensible.

### 3.7 Módulo de Dashboards y Reportes

El módulo de dashboards proporciona una visión analítica del negocio.

Incluye métricas como ventas totales, productos más vendidos, estado del inventario y rendimiento general del negocio. Los reportes se generan a partir de consultas agregadas sobre la base de datos y se presentan mediante visualizaciones gráficas.

Este módulo está orientado a la toma de decisiones basada en datos.

### 3.8 Sistema de Alertas y Control de Stock

Este sistema complementa el módulo de inventario mediante alertas automáticas.

Notifica cuando los productos alcanzan niveles críticos de stock o cuando requieren reposición. Estas alertas permiten una gestión preventiva del inventario, evitando quiebres de stock y mejorando la continuidad operativa del negocio.

El sistema puede ser extendido en el futuro para incluir notificaciones en tiempo real o integración con proveedores.

---

## 4. Implementación de la Lógica de Negocio

La lógica de negocio define el conjunto de reglas y comportamientos que gobiernan el funcionamiento del sistema. Se encarga de asegurar la coherencia de los datos, la automatización de procesos críticos y la aplicación de reglas operativas propias del dominio de una juguetería o comercio minorista.

En una arquitectura MERN, esta lógica se implementa principalmente en el backend (Node.js + Express), coordinando operaciones entre la base de datos (MongoDB) y las peticiones provenientes del frontend (React).

### 4.1 Actualización Automática de Stock

El sistema implementa una actualización automática del stock como parte del flujo de ventas.

Cada vez que se registra una venta en el módulo POS, el sistema descuenta automáticamente la cantidad correspondiente de cada producto en inventario. Esta operación se realiza de forma transaccional a nivel de lógica de aplicación para evitar inconsistencias entre ventas registradas y disponibilidad real de productos.

En caso de que el stock llegue a cero o a un umbral crítico, el sistema marca el producto como no disponible o en estado de reposición, dependiendo de su configuración.

### 4.2 Gestión de Reposición

La gestión de reposición se encarga de mantener niveles adecuados de inventario mediante reglas de control automático y alertas.

El sistema identifica productos con stock bajo a partir de umbrales predefinidos. Cuando se detecta esta condición, se generan alertas internas para facilitar la reposición por parte del área responsable.

Además, se mantiene un historial de movimientos de reposición, lo que permite analizar patrones de consumo y anticipar necesidades de compra.

### 4.3 Validaciones del Sistema

El sistema implementa múltiples niveles de validación para asegurar la integridad de los datos.

Las validaciones incluyen controles de entrada en el frontend, validaciones en el backend antes de persistir datos y reglas definidas en los esquemas de MongoDB. Estas validaciones abarcan campos obligatorios, formatos de datos, rangos válidos y restricciones de unicidad.

Este enfoque evita inconsistencias, duplicaciones y errores de integridad referencial en la base de datos.

### 4.4 Control de Permisos

El control de permisos se basa en un modelo de autorización por roles.

Cada usuario del sistema posee un rol asociado que determina qué operaciones puede realizar. Estas restricciones se aplican a nivel de middleware en el backend, interceptando las peticiones antes de que lleguen a la lógica de negocio.

De esta forma, se garantiza que solo usuarios autorizados puedan acceder a funcionalidades sensibles como gestión de productos, facturación o administración de usuarios.

### 4.5 Generación de Reportes

El sistema genera reportes a partir de datos consolidados almacenados en la base de datos.

Estos reportes incluyen información sobre ventas, stock, productos más vendidos y comportamiento general del negocio. La generación de reportes se realiza mediante consultas agregadas que procesan grandes volúmenes de datos y los transforman en métricas útiles para la toma de decisiones.

Los resultados se exponen en el frontend mediante visualizaciones gráficas, facilitando el análisis operativo y estratégico del negocio.

---

## 5. Documentación de Interfaces y Funcionalidades

Este apartado describe las principales interfaces del sistema y su comportamiento funcional desde la perspectiva del usuario. El objetivo es detallar cómo se interactúa con la aplicación, qué operaciones están disponibles y cómo se organizan las funcionalidades dentro de la interfaz web desarrollada en React.

La interfaz está diseñada bajo principios de simplicidad operativa, consistencia visual y orientación a tareas, priorizando el uso eficiente del sistema en entornos comerciales.

### 5.1 Menú y Navegación General
![5.1 Menú y Navegación General](./screenshots/5.1.png)

El sistema cuenta con un menú lateral principal que centraliza el acceso a todos los módulos funcionales.

La navegación está estructurada por secciones lógicas (ventas, inventario, productos, usuarios, reportes), permitiendo al usuario moverse entre módulos sin perder el contexto operativo. El menú es dinámico y se adapta según el rol del usuario, ocultando o mostrando opciones en función de sus permisos.

Este enfoque mejora la usabilidad y reduce la complejidad operativa para usuarios no técnicos.


### 5.2 Patrón CRUD General
![5.2 Patrón CRUD General](./screenshots/5.2.png)

La mayoría de los módulos del sistema siguen un patrón CRUD (Create, Read, Update, Delete), que estandariza la interacción con los datos.

Cada entidad del sistema (productos, usuarios, proveedores, etc.) dispone de interfaces consistentes para:

- Crear nuevos registros mediante formularios estructurados
- Visualizar listados con filtros y paginación
- Editar información existente
- Eliminar registros con validaciones de seguridad

Este patrón garantiza uniformidad en la experiencia de usuario y reduce la curva de aprendizaje del sistema.

### 5.3 Casos Especiales por Módulo
![5.3 Casos Especiales por Módulo](./screenshots/5.3.png)

Algunos módulos presentan comportamientos específicos que extienden el patrón CRUD estándar debido a la complejidad del dominio.

#### 5.3.1 Usuarios y Empleados
![5.3.1 Usuarios y Empleados](./screenshots/5.3.1.png)

La gestión de usuarios incluye funcionalidades adicionales como asignación de roles, activación o desactivación de cuentas y control de acceso.

En el caso de empleados, se maneja información organizacional vinculada a áreas, posiciones y supervisión, lo que permite representar la estructura interna del negocio.


#### 5.3.2 Roles y Permisos
![5.3.2 Roles y Permisos](./screenshots/5.3.2.png)

Este módulo permite definir el nivel de acceso de cada usuario dentro del sistema.

Los roles agrupan permisos específicos que controlan qué acciones puede realizar un usuario. La asignación de roles se realiza de forma dinámica, lo que permite adaptar el sistema a diferentes estructuras organizativas sin modificar la lógica base.


#### 5.3.3 Productos y Clasificación por Categorías
![5.3.3 Productos y Clasificación por Categorías](./screenshots/5.3.3.png)

La gestión de productos incluye una clasificación estructurada por categorías y atributos comerciales.

Cada producto contiene información como precio, proveedor asociado y rango etario recomendado. La categorización facilita la búsqueda, el filtrado y el análisis del catálogo de productos.


#### 5.3.4 Inventario y Movimientos de Stock
![5.3.4 Inventario y Movimientos de Stock](./screenshots/5.3.4.png)

El módulo de inventario permite visualizar el estado actual del stock y los movimientos asociados.

Cada modificación en el inventario queda registrada como un movimiento, lo que permite trazabilidad completa de entradas y salidas de productos. Esta funcionalidad es clave para el control operativo del negocio.

#### 5.3.5 Facturación y Ventas
![5.3.5 Facturación y Ventas](./screenshots/5.3.5.png)

La interfaz de ventas permite registrar transacciones de manera rápida a través del módulo POS.

Cada venta genera automáticamente una factura asociada, que queda almacenada para su consulta posterior. El sistema permite visualizar el detalle de cada operación, incluyendo productos, cantidades y totales.

#### 5.3.6 Alertas de Reposición
![5.3.6 Alertas de Reposición](./screenshots/5.3.6.png)

Las alertas de reposición se muestran dentro de la interfaz como notificaciones del sistema.

Estas alertas informan cuando un producto alcanza niveles mínimos de stock, permitiendo una reacción rápida por parte del usuario responsable. El objetivo es evitar quiebres de stock y mantener la continuidad operativa.

#### 5.3.7 Reportes Comerciales
![5.3.7 Reportes Comerciales](./screenshots/5.3.7.png)

El módulo de reportes presenta información agregada del sistema mediante gráficos y tablas.

Incluye métricas de ventas, rendimiento de productos y estado general del inventario. Estos datos se presentan de forma visual para facilitar el análisis y la toma de decisiones.

### 5.4 Interfaces de Dashboards y Reportes
![5.4 Interfaces de Dashboards y Reportes](./screenshots/5.4.png)

El dashboard principal actúa como panel de control del sistema.

Desde esta interfaz se accede a indicadores clave del negocio, como ventas totales, productos más vendidos y estado del inventario. La información se actualiza dinámicamente en función de los datos almacenados en la base de datos.

El objetivo del dashboard es proporcionar una visión global del estado del negocio en tiempo real, facilitando la gestión operativa y estratégica.

---

## 6. Sistema de Autenticación y Seguridad

El sistema de autenticación y seguridad define los mecanismos utilizados para proteger el acceso a la plataforma, garantizar la integridad de los datos y controlar las operaciones que cada usuario puede realizar.

La arquitectura de seguridad se implementa en el backend utilizando Node.js y Express, con soporte de tokens, control de sesiones lógicas y validación basada en roles.

### 6.1 Características Generales

El sistema de seguridad está diseñado bajo un enfoque de defensa en profundidad, incorporando múltiples capas de protección.

Incluye autenticación de usuarios, control de permisos, validación de datos, protección de rutas y manejo de sesiones seguras. Estas capas trabajan de forma conjunta para evitar accesos no autorizados y reducir riesgos de manipulación de datos.

La seguridad no se implementa como un componente aislado, sino como un conjunto de reglas transversales aplicadas en toda la aplicación.

### 6.2 Autenticación

La autenticación es el proceso mediante el cual el sistema verifica la identidad del usuario.

Se implementa mediante credenciales (usuario y contraseña) almacenadas de forma segura en la base de datos, utilizando hashing para proteger la información sensible.

Una vez autenticado, el sistema genera una sesión o token que permite al usuario interactuar con la aplicación sin necesidad de volver a ingresar credenciales en cada solicitud.

### 6.3 Autorización

La autorización determina qué acciones puede realizar un usuario autenticado dentro del sistema.

Se basa en un modelo de roles y permisos, donde cada rol define un conjunto específico de capacidades. Estos permisos controlan el acceso a módulos como inventario, ventas, facturación y administración de usuarios.

Antes de ejecutar cualquier operación sensible, el sistema valida que el usuario tenga los permisos adecuados.

### 6.4 Roles Temporales

El sistema incorpora un mecanismo de roles temporales que permite asignar permisos con fecha de expiración.

Este enfoque permite otorgar accesos limitados en el tiempo, los cuales se revocan automáticamente una vez cumplido el período definido. Esto es útil en escenarios como permisos administrativos temporales o accesos de prueba.

El sistema gestiona automáticamente la expiración y restauración de roles anteriores cuando corresponde.

### 6.5 Protección de Rutas

Las rutas del sistema están protegidas mediante middleware en el backend.

Cada solicitud es interceptada antes de ejecutar la lógica principal, verificando primero la autenticación del usuario y luego sus permisos específicos.

Si el usuario no cumple con los requisitos de acceso, la solicitud es rechazada y no se ejecuta la operación solicitada. Este mecanismo evita accesos directos no autorizados a recursos internos.

### 6.6 Buenas Prácticas de Seguridad

El sistema implementa varias buenas prácticas de seguridad para reducir vulnerabilidades y proteger la información.

Entre ellas se incluyen el uso de hashing para contraseñas, validación de entradas en múltiples capas, control de acceso basado en roles, manejo seguro de tokens y separación clara entre lógica de negocio y seguridad.

Además, se evita el acceso directo a datos sensibles desde el frontend, centralizando todas las operaciones críticas en el backend.

---

## 7. Sistema de Testing  

El sistema de testing está diseñado para validar el comportamiento del sistema de forma automatizada, asegurando consistencia entre módulos y reduciendo la probabilidad de regresiones al introducir cambios. Se centra en la verificación de funcionalidades críticas del negocio, especialmente en autenticación, inventario y operaciones transaccionales.

### 7.1 Testing con TDD (Test-Driven Development)

El enfoque Test-Driven Development (TDD) se utiliza como metodología de diseño incremental. Primero se define el comportamiento esperado mediante pruebas automatizadas, y luego se implementa la funcionalidad necesaria para cumplirlas. Esto favorece una arquitectura más controlada y reduce dependencias implícitas.

Este enfoque se aplica principalmente en:
- Autenticación y autorización de usuarios
- Operaciones CRUD de entidades principales
- Reglas de negocio vinculadas a stock, ventas y facturación

El ciclo de trabajo sigue la secuencia: test → implementación → refactorización.

### 7.2 Stack de Testing

El entorno de pruebas se basa en herramientas del ecosistema Node.js:

- Jest como framework principal para ejecución de tests y aserciones.
- Supertest para simulación de peticiones HTTP sobre la API Express.
- MongoDB Memory Server para base de datos en memoria durante pruebas.
- Mongoose para interacción con modelos dentro del entorno de testing.

Esta combinación permite ejecutar pruebas aisladas sin depender de servicios externos, garantizando reproducibilidad.

### 7.3 Comandos Disponibles

El proyecto incluye scripts definidos en npm para distintos escenarios de testing:

- npm test: ejecuta la suite completa de pruebas.
- npm run test:watch: ejecuta tests en modo observación para desarrollo continuo.
- npm run test:coverage: genera reportes de cobertura de código.

Estos comandos permiten alternar entre validación puntual y monitoreo continuo durante el desarrollo.

### 7.4 Tests Implementados

Las pruebas están organizadas en distintos niveles según su alcance:

- Tests unitarios: validan funciones auxiliares, helpers y utilidades aisladas.
- Tests de integración: verifican la interacción entre rutas, controladores y base de datos.
- Tests de autenticación: validan login, sesiones y control de acceso por usuario.
- Tests de API REST: validan endpoints completos con escenarios exitosos y de error.

Cada test incluye casos positivos y negativos para validar comportamiento esperado y manejo de fallos.

### 7.5 Cobertura y Validaciones

La cobertura de código se mide mediante Jest, generando reportes detallados por módulo.

Se analizan métricas como:
- Statements cubiertos
- Branches ejecutadas
- Functions invocadas
- Líneas de código cubiertas

El objetivo no es únicamente alcanzar un porcentaje alto, sino garantizar que los flujos críticos del sistema estén correctamente protegidos.

Se prioriza la cobertura en:
- Autenticación y seguridad
- Inventario y movimientos de stock
- Procesos de facturación y ventas

---

## 8. Cómo Ejecutar el Proyecto

El proyecto está diseñado para ejecutarse en un entorno basado en Node.js con MongoDB como base de datos, por lo que requiere una configuración mínima del entorno de desarrollo antes de su ejecución.

### 8.1 Clonar el Repositorio

El primer paso consiste en obtener el código fuente del proyecto desde el repositorio correspondiente utilizando Git. Una vez clonado, se accede al directorio raíz del proyecto para continuar con la instalación.

### 8.2 Instalar Dependencias

El sistema depende de múltiples librerías del ecosistema Node.js. Todas las dependencias necesarias se instalan mediante npm.

- pnpm install

Este proceso descarga e instala los módulos definidos en el archivo package.json, incluyendo dependencias del backend, testing y utilidades del sistema.

### 8.3 Configurar MongoDB

El sistema utiliza MongoDB como base de datos NoSQL. Puede ejecutarse en entorno local o mediante un servicio en la nube como MongoDB Atlas.

Es necesario asegurar que la cadena de conexión esté correctamente configurada y accesible desde la aplicación para permitir la persistencia de datos.

### 8.4 Variables de Entorno

La aplicación requiere un archivo .env en la raíz del proyecto para definir parámetros de configuración.

Variables principales:

- PORT: puerto en el que se ejecuta el servidor.
- MONGO_URI: cadena de conexión a MongoDB.
- JWT_SECRET: clave secreta utilizada para la firma de tokens.
- NODE_ENV: entorno de ejecución (development/production).

Estas variables permiten separar la configuración del código fuente.

### 8.5 Ejecutar la Aplicación

Para iniciar el servidor en modo desarrollo se utiliza:

- pnpm run dev

En modo producción:

- pnpm start

Una vez ejecutado, el sistema levanta el servidor Express y establece la conexión con la base de datos.

Para iniciar la aplicación, desde la carpeta \client (cd client), se utiliza al igual que en el caso del servidor, los comandos __pnpm run dev__ o __pnpm start__.

### 8.6 Acceder desde el Navegador

Con la aplicación en ejecución, el sistema puede ser accedido desde un navegador web en la siguiente dirección:

http://localhost:5173

Desde esta interfaz se accede a todas las funcionalidades del sistema, incluyendo autenticación, módulos operativos y dashboards.

---

## 9. Uso de Inteligencia Artificial

El proyecto incorpora el uso de herramientas de inteligencia artificial como apoyo durante el proceso de análisis, desarrollo y documentación. Estas herramientas no reemplazan la lógica de diseño del sistema, sino que funcionan como asistencia técnica para acelerar tareas específicas y reducir errores en etapas repetitivas.

### 9.1 Herramientas Utilizadas

Durante el desarrollo se utilizaron herramientas de inteligencia artificial para soporte en distintas áreas del proyecto:

- Modelos de lenguaje para asistencia en programación y refactorización de código.
- Generación y corrección de documentación técnica.
- Apoyo en la estructuración de arquitectura y organización de módulos.
- Asistencia en resolución de errores y debugging conceptual.

Estas herramientas fueron utilizadas como apoyo complementario al desarrollo manual.

### 9.2 Asistencia en el Desarrollo

La inteligencia artificial fue utilizada principalmente como soporte técnico durante el ciclo de desarrollo del sistema.

Su aplicación se centró en:

- Explicación y resolución de problemas de lógica en backend.
- Optimización de estructuras de código en Node.js y MongoDB.
- Sugerencias de arquitectura basada en patrones como MVC.
- Apoyo en la implementación de autenticación y autorización.
- Clarificación de conceptos técnicos durante el desarrollo.

El uso de estas herramientas permitió acelerar iteraciones de desarrollo y mejorar la consistencia del código.

### 9.3 Generación de Documentación y Testing

La inteligencia artificial también fue utilizada como apoyo en la generación y mejora de documentación técnica del sistema.

En este contexto se utilizó para:

- Redacción y estructuración de documentación funcional y técnica.
- Mejora de claridad en descripciones de módulos y arquitectura.
- Asistencia en la definición de casos de prueba.
- Organización de secciones de testing y cobertura.
- Revisión de consistencia en la documentación general del proyecto.

El contenido generado fue posteriormente revisado y adaptado manualmente para asegurar su coherencia con la implementación real del sistema.

---

## 10. Conclusión Final

El sistema desarrollado cumple con el objetivo de centralizar y optimizar la gestión operativa de una juguetería mediante una plataforma web basada en arquitectura moderna. A lo largo del proyecto se integraron módulos clave como ventas, inventario, productos, proveedores, usuarios y reportes, logrando una solución coherente y funcional orientada a la administración integral del negocio.

La adopción de una arquitectura tipo MERN (MongoDB, Express, React, Node.js) permitió construir un sistema escalable, modular y mantenible. El uso de MongoDB facilitó la flexibilidad en el modelado de datos, mientras que Node.js y Express permitieron estructurar una API robusta para la lógica del backend. Por su parte, React habilitó una interfaz dinámica y responsiva para la interacción con el usuario.

Asimismo, la implementación de mecanismos de autenticación y autorización fortaleció la seguridad del sistema, asegurando el control de acceso por roles y la protección de rutas sensibles. Esto resulta fundamental en un entorno donde múltiples usuarios interactúan con datos críticos del negocio.

El sistema de testing incorporado contribuyó a garantizar la estabilidad del software, permitiendo validar comportamientos clave y reducir riesgos de regresión durante el desarrollo. Complementariamente, la incorporación de herramientas de inteligencia artificial apoyó el proceso de desarrollo, documentación y depuración, mejorando la eficiencia general del proyecto.

En términos generales, el sistema logra reemplazar procesos manuales y dispersos por una solución centralizada, estructurada y orientada a datos, aportando mejoras en eficiencia operativa, control de información y capacidad de análisis para la toma de decisiones.

Como posibles mejoras futuras se identifican la integración de funcionalidades de comercio electrónico, aplicaciones móviles y sistemas de análisis avanzado basados en datos en tiempo real.

---

## 11. Bibliografía y Fuentes

El desarrollo del sistema se apoyó en documentación oficial, recursos técnicos y material de referencia relacionado con las tecnologías utilizadas.

### Documentación Oficial

- Node.js Documentation: https://nodejs.org/en/docs/
- Express.js Guide: https://expressjs.com/
- MongoDB Manual: https://www.mongodb.com/docs/
- Mongoose Documentation: https://mongoosejs.com/docs/
- React Documentation: https://react.dev/
- JWT Introduction: https://jwt.io/introduction/

### Herramientas de Testing

- Jest Documentation: https://jestjs.io/docs/getting-started
- Supertest Repository: https://github.com/ladjs/supertest
- MongoDB Memory Server: https://github.com/typegoose/mongodb-memory-server

### Control de Versiones

- Git Documentation: https://git-scm.com/doc
- GitHub Docs: https://docs.github.com/

### Conceptos de Arquitectura

- Model-View-Controller (MVC) Pattern: https://developer.mozilla.org/en-US/docs/Glossary/MVC
- REST API Design Principles: https://restfulapi.net/

### Recursos Adicionales

- MDN Web Docs (JavaScript, HTML, CSS): https://developer.mozilla.org/
- OWASP Security Guidelines: https://owasp.org/www-project-top-ten/

### Nota

Algunas secciones del sistema, especialmente relacionadas con arquitectura, testing y documentación, fueron apoyadas con herramientas de inteligencia artificial, posteriormente validadas y ajustadas manualmente para asegurar consistencia con la implementación real del proyecto.
