---
title: 'Home'
date: 2025-09-21
type: landing

sections:
  - block: hero
    content:
      eyebrow: RTK IT Services
      title: Turn your IT challenges into [business advantage]
      text: IT consulting, support, systems architecture, and cloud migrations — tailored to help your business adopt modern technology with confidence.
      primary_action:
        text: Get in touch
        url: "/#contact"
        icon: rocket-launch
        style: gradient
      secondary_action:
        text: Our services
        url: "/#services"
        icon: arrow-down
        style: ghost
      trust:
        stars: 5
        text: "Trusted IT partner for growing businesses"
    design:
      spacing:
        padding: [0, 0, 0, 0]
        margin: [0, 0, 0, 0]

  - block: features
    id: services
    content:
      subtitle: What we do
      title: IT solutions tailored to your business
      text: From strategy to implementation, we keep your technology aligned with your goals.
      items:
        - name: IT Consulting
          icon: light-bulb
          description: Expert guidance to optimize your technology strategy, address unique business challenges, and align IT with your objectives.
        - name: Cloud Migrations
          icon: cloud
          description: Seamlessly transition your business to the cloud with minimal disruption, harnessing the power and scalability of modern platforms.
        - name: Systems Architecture
          icon: squares-2x2
          description: Design and implement robust, scalable, and secure IT infrastructure that grows with your business needs.
        - name: IT Support
          icon: lifebuoy
          description: Reliable, responsive support that keeps your systems running so your team can stay focused on the work that matters.
        - name: Proof-of-Concept Stacks
          icon: beaker
          description: Validate new ideas fast with proof-of-concept tech stacks designed to de-risk your next technology investment.
        - name: Infrastructure Optimization
          icon: adjustments-horizontal
          description: Audit and tune your existing IT infrastructure for maximum efficiency, reliability, and cost-effectiveness.
    design:
      layout: bento
      css_class: "bg-gray-50 dark:bg-gray-900/50"

  - block: stats
    content:
      items:
        - statistic: "100%"
          description: |
            Focused on your  
            business goals
        - statistic: "24/7"
          description: |
            Reliable IT  
            support
        - statistic: "5★"
          description: |
            Tailored, expert  
            solutions
    design:
      layout: minimal
      numbers_gradient: true
      css_class: "bg-white dark:bg-gray-900"
      spacing:
        padding: ["3rem", 0, "3rem", 0]

  - block: features
    id: projects
    content:
      subtitle: Our portfolio
      title: Projects and case studies
      text: A selection of the work we deliver for our clients.
      items:
        - name: Cloud Migration Solutions
          icon: cloud
          description: Seamlessly transition your business to the cloud with our expert migration services, ensuring a smooth move with minimal disruption.
        - name: IT Consulting Services
          icon: briefcase
          description: Tailored IT consulting to optimize technology strategies — from strategy through implementation, aligned to your objectives.
        - name: Systems Architecture Design
          icon: squares-2x2
          description: Comprehensive systems architecture design ensuring your IT infrastructure is scalable, secure, and efficient.
    design:
      layout: cards

  - block: cta-card
    id: contact
    content:
      title: Ready to achieve your business goals with the right IT partner?
      text: Let's talk about how RTK IT Services can help you adopt modern technology with confidence.
      button:
        text: Get in touch
        url: "mailto:info@rtkitservices.com"
    design:
      card:
        css_class: "bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white shadow-2xl"
        css_style: ""
---
