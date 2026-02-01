(function ($) {
	"use strict";
	var wind = $(window);

	// Var Background image
	var pageSection = $(".bg-img, section");
	pageSection.each(function (indx) {
		if ($(this).attr("data-background")) {
			$(this).css("background-image", "url(" + $(this).data("background") + ")");
		}
	});
	var nav = $('nav');
	var navHeight = nav.outerHeight();
	$('.navbar-toggler').on('click', function () {
		if (!$('#mainNav').hasClass('navbar-reduce')) {
			$('#mainNav').addClass('navbar-reduce');
		}
	});

	// Navbar Menu Reduce 
	$(window).trigger('scroll');
	$(window).on('scroll', function () {
		var pixels = 70;
		var top = 1200;
		if ($(window).scrollTop() > pixels) {
			$('.navbar-expand-lg').addClass('navbar-reduce');
			$('.navbar-expand-lg').removeClass('navbar-trans');
		} else {
			$('.navbar-expand-lg').addClass('navbar-trans');
			$('.navbar-expand-lg').removeClass('navbar-reduce');
		}
		if ($(window).scrollTop() > top) {
			$('.scrolltop-mf').fadeIn(1000, "easeInOutExpo");
		} else {
			$('.scrolltop-mf').fadeOut(1000, "easeInOutExpo");
		}
	});
	// Back to top button 
	$(function () {
		// Scroll Event
		$(window).on('scroll', function () {
			var scrolled = $(window).scrollTop();
			if (scrolled > 300) $('.back-to-top').addClass('active');
			if (scrolled < 300) $('.back-to-top').removeClass('active');
		});
		// Click Event
		$('.back-to-top').on('click', function () {
			$("html, body").animate({
				scrollTop: "0"
			}, 500);
		});
	});
	//  Star Scrolling nav
	$('a.js-scroll[href*="#"]:not([href="#"])').on("click", function () {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				$('html, body').animate({
					scrollTop: (target.offset().top - navHeight + 30)
				}, 1000, "easeInOutExpo");
				return false;
			}
		}
	});
	// Closes responsive menu when a scroll trigger link is clicked
	$('.js-scroll').on("click", function () {
		$('.navbar-collapse').collapse('hide');
	});
	// Activate scrollspy to add active class to navbar items on scroll
	$('body').scrollspy({
		target: '#mainNav',
		offset: navHeight
	});
	
	//  Product shop owl
	$('#product-shop-slide').owlCarousel({
		margin: 0,
		autoplay: true,
		autoplayTimeout: 4000,
		nav: false,
		smartSpeed: 1000,
		dots: false,
		autoplayHoverPause: true,
		loop: true,
        responsiveClass:true,
		responsive: {
			0: {
				items: 1
			},
			600: {
				items: 2
			},
			1000: {
				items: 3
			}
		}
	});
	
	// Testimonials owl
	$('#testimonial-slide').owlCarousel({
		margin: 0,
		autoplay: true,
		autoplayTimeout: 4000,
		nav: false,
		smartSpeed: 800,
		dots: true,
		autoplayHoverPause: true,
		loop: true,
		responsiveClass: true,
		responsive: {
			0: {
				items: 1
			},
			768: {
				items: 1
			},
			1000: {
				items: 3
			}
		}
	});

		// Menu of The Day Tab
		$('.menu-day-tab-list  li > a ').on('click', function (e) {
			e.preventDefault();
			var target = $(this).attr('href');
			$(this).closest('li').siblings('li').removeClass('active');
			$(this).closest('li').addClass('active');
			$(target).addClass('active');
			$(target).siblings('.menu-single-tab-content').removeClass('active');
		});

	// MagnificPopup 
	$('.gallery-container').magnificPopup({
		delegate: '.popimg',
		type: 'image',
		gallery: {
			enabled: true
		}
	});
	// Porfolio isotope and filter
	$(window).on('load', function () {
		var galleryIsotope = $('.gallery-container').isotope({
			itemSelector: '.gallery-grid-item'
		});
		$('#gallery-flters li').on('click', function () {
			$("#gallery-flters li").removeClass('filter-active');
			$(this).addClass('filter-active');
			galleryIsotope.isotope({
				filter: $(this).data('filter')
			});
		});
	});
	// WOW JS
	$(window).on('load', function () {
		if ($(".wow").length) {
			var wow = new WOW({
				boxClass: 'wow', // Animated element css class (default is wow)
				animateClass: 'animated', // Animation css class (default is animated)
				offset: 30, // Distance to the element when triggering the animation (default is 0)
				mobile: false, // Trigger animations on mobile devices (default is true)
				live: true, // Act on asynchronously loaded content (default is true)
			});
			wow.init();
		}
	});
	// Preloader Area
	jQuery(window).on('load', function () {
	  jQuery('.preloader').delay(500).fadeOut('slow');
	});
	
})(jQuery);



const servicesData = {
	"BASIC_CAR_CARE_SERVICES": [
	  "Wiper Blade Installation",
	  "Check Engine Light Code Retrieval",
	  "Air Filter Replacement Installation",
	  "Starting and Charging System Evaluation",
	  "Tyre Pressure Check and Adjustment",
	  "Visual Brake Inspection",
	  "Fluid Level Check (Engine Oil, Brake Fluid, etc.)",
	  "Exhaust System Inspection",
	  "Exterior Light Check",
	  "Battery Voltage Check",
	  "Radiator Cap Inspection"
	],
	"FLUID_SERVICES": [
	  "Engine Flush Service",
	  "Transmission Fluid Service",
	  "Brake Fluid Exchange",
	  "Coolant Drain and Fill",
	  "Power Steering Flush",
	  "Differential Fluid Service",
	  "Transfer Case Fluid Service",
	  "Fuel System Cleaning",
	  "Windshield Washer Fluid Refill",
	  "Oil Change (Synthetic and Conventional)",
	  "Hydraulic Fluid Exchange"
	],
	"MAINTENANCE_SERVICES": [
	  "Headlight Restoration",
	  "Small Bulb Installation",
	  "Cabin Air Filter Install",
	  "Spring Maintenance Package",
	  "Battery Inspection and Cleaning",
	  "Timing Belt Inspection and Replacement",
	  "Serpentine Belt Replacement",
	  "Spark Plug Replacement",
	  "Fuel Filter Replacement",
	  "Radiator Cleaning and Maintenance",
	  "Air Conditioning Filter Replacement",
	  "Drive Belt Replacement",
	  "PCV Valve Replacement",
	  "Timing Chain Inspection and Adjustment",
	  "Valve Clearance Check",
	  "Idle Air Control Valve Inspection"
	],
	"TUNE_UPS": [
		"Small Bulb Installation",
		"Cranks No Start Diagnostic Service",
		"Engine Cooling System Check",
		"Headlight Restoration",
		"Ignition System Check",
		"Throttle Body Cleaning",
		"Air Intake System Inspection",
		"Exhaust System Evaluation",
		"Fuel Injection Cleaning",
		"O2 Sensor Inspection",
		"PCV Valve Cleaning",
		"Mass Airflow Sensor Check",
		"Idle Speed Adjustment"
	  ],
	"HOME_WASH_SERVICES": [
	  "Spring Maintenance Package",
	  "Summer Maintenance Package",
	  "Winter Maintenance Package",
	  "Smoke Test Diagnostic Service",
	  "Full Exterior Hand Wash and Dry",
	  "Interior Cleaning (Vacuuming, Dusting)",
	  "Engine Bay Cleaning",
	  "Headlight Lens Polishing",
	  "Underbody Wash",
	  "Waxing and Polishing",
	  "Tyre Shine and Detailing"
	],
	"SYSTEM_EVALUATIONS": [
	  "A/C System Leak Evaluation",
	  "Steering and Suspension System Evaluation",
	  "Coolant System Evaluation",
	  "Cranks No Start Diagnostic Service",
	  "2nd A/C System Repair Evaluation",
	  "Fuel Injection System Evaluation",
	  "Brake System Evaluation",
	  "Battery Load Test",
	  "Engine Compression Test",
	  "Charging System Check",
	  "Vacuum Leak Check",
	  "Exhaust Emission Check"
	],
	"TYRE_SERVICES": [
	  "Tyre Rotation",
	  "Tyre Balancing",
	  "Tyre Pressure Monitoring System (TPMS) Check",
	  "Tyre Replacement",
	  "Puncture Repair",
	  "Tyre Alignment",
	  "Run-flat Tyre Services",
	  "Low-Profile Tyre Services",
	  "Flat Tyre Repair",
	  "Tyre Mounting and Demounting",
	  "High-Performance Tyre Installations"
	],
	"ELECTRICAL_SERVICES": [
	  "Alternator Testing and Replacement",
	  "Starter Motor Repair",
	  "Wiring and Electrical Repairs",
	  "Battery Replacement",
	  "Fuse Box Inspection and Repair",
	  "Window Motor and Regulator Repair",
	  "Headlight and Taillight Replacement",
	  "Fog Light Installation",
	  "Power Window Repair",
	  "Lock and Key Services (key fob programming)",
	  "Battery Terminal Cleaning"
	],
	"SUSPENSION_SERVICES": [
	  "Shock and Strut Replacement",
	  "Suspension System Inspection",
	  "Ball Joint Replacement",
	  "Steering Rack Repair",
	  "Sway Bar Link Replacement",
	  "Control Arm Replacement",
	  "Coil Spring Replacement",
	  "Air Suspension Repair",
	  "Suspension Bushing Replacement",
	  "Ride Height Adjustment",
	  "Steering Column Repair"
	],
	"TRANSMISSION_SERVICES": [
	  "Automatic Transmission Fluid Exchange",
	  "Transmission Filter Replacement",
	  "Manual Transmission Service",
	  "Clutch Repair and Replacement",
	  "Transmission Diagnostic Services",
	  "Transmission Mount Replacement",
	  "Transmission Overhaul",
	  "Gearbox Repair",
	  "Clutch Slave Cylinder Replacement",
	  "Differential Repair",
	  "Torque Converter Replacement"
	],
	"ENGINE_REPAIR_SERVICES": [
	  "Engine Overhaul",
	  "Cylinder Head Repair",
	  "Valve Replacement",
	  "Timing Belt Repair",
	  "Engine Compression Test",
	  "Engine Mount Replacement",
	  "Timing Chain Repair",
	  "Crankshaft and Camshaft Replacement",
	  "Oil Pump Replacement",
	  "Fuel Pump Replacement",
	  "Engine Gasket Replacement"
	],
	"BRAKE_SERVICES": [
	  "Brake Pad Replacement",
	  "Brake Rotor Resurfacing",
	  "Brake Fluid Flush",
	  "Brake Line Inspection and Replacement",
	  "Anti-lock Brake System (ABS) Check",
	  "Brake Shoe Replacement",
	  "Brake Caliper Replacement",
	  "Brake Drum Replacement",
	  "Parking Brake Adjustment",
	  "Hydraulic Brake Line Replacement"
	],
	"AIR_CONDITIONING_SERVICES": [
	  "A/C Recharge and Refilling",
	  "A/C Compressor Replacement",
	  "A/C Condenser Repair",
	  "A/C Evaporator Repair",
	  "A/C System Leak Detection",
	  "Cabin Air Filter Replacement",
	  "Blower Motor Repair",
	  "Refrigerant Leak Repair",
	  "A/C Cooling Capacity Check",
	  "Air Duct Cleaning"
	],
	"BODY_REPAIR_DETAILING": [
	  "Dent Removal",
	  "Bumper Repair and Replacement",
	  "Collision Repair",
	  "Paint Scratch Repair",
	  "Frame Straightening",
	  "Paintless Dent Repair",
	  "Auto Body Refinishing",
	  "Windshield Chip Repair",
	  "Full Car Detailing",
	  "Leather Seat Restoration"
	],
	"HYBRID_ELECTRIC_VEHICLE_SERVICES": [
	  "Hybrid Battery Inspection and Replacement",
	  "Electric Vehicle Charging System Diagnosis",
	  "Hybrid System Diagnostics",
	  "EV Battery Cooling System Maintenance",
	  "Electric Motor Repair",
	  "Charging Port and Adapter Repair",
	  "EV Brake Maintenance",
	  "Hybrid Transmission Service"
	],
	"DIAGNOSTIC_SERVICES": [
	  "OBD-II Scanner Diagnostics",
	  "Engine Diagnostics",
	  "Transmission Diagnostics",
	  "Fuel System Diagnostics",
	  "Exhaust System Diagnostics",
	  "Emissions Test",
	  "Noise Diagnosis and Inspection",
	  "Vibration Diagnosis"
	]
  }
  
function createServiceDiv(category, services) {
  const container = document.createElement('div');
  container.classList.add('col-xl-6', 'col-lg-6', 'col-md-12', 'col-sm-12', 'col-12');

  const infoBox = document.createElement('div');
  infoBox.classList.add('vc-menu-product-info-box');
  container.appendChild(infoBox);

  const heading = document.createElement('h4');
  heading.classList.add('menu-product-details',"mb-3");
  heading.innerHTML = `<span style="color:var(--primary-color);">${category.replaceAll("_"," ")}</span>`;
  infoBox.appendChild(heading);

  services.forEach(service => {
    const serviceDiv = document.createElement('div');
    serviceDiv.classList.add('menu-product-description');
    serviceDiv.innerText = service;
    infoBox.appendChild(serviceDiv);
  });

  return container;
}

function displayServices() {
  const parentDiv = document.getElementById('services-container'); // This div should exist in your HTML
  for (const [category, services] of Object.entries(servicesData)) {
    const serviceDiv = createServiceDiv(category, services);
    parentDiv.appendChild(serviceDiv);
  }
}

displayServices();
