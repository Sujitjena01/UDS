/**
 * assets/pages/layout.js
 *
 * Renders the BAMS app shell: sidebar, header, and footer.
 * Include jQuery before this file.
 *
 * Sidebar → <div id="sidebar-placeholder" data-active="dashboard"></div>
 *   Collapse state persists to localStorage.
 *
 * Header  → <div id="header-placeholder"
 *                data-search-placeholder="Search by BA ID, Name, or Department..."
 *                data-user-name="BA Login"
 *                data-user-sub="Adishakti Agency"
 *                data-user-avatar="assets/images/avatar.svg"></div>
 *
 * Footer  → <div id="footer-placeholder"></div>
 */
(function ($) {
  "use strict";

  // =====================================================
  // Sidebar
  // =====================================================
  var NAV_ITEMS = [
    {
      key: "dashboard",
      label: "Dashboard",
      href: "index.html",
      icon: "fa-solid fa-gauge-high",
    },
    {
      key: "id-card-search",
      label: "ID Card Search",
      href: "#",
      icon: "fa-solid fa-id-card",
    },
    {
      key: "manage-cards",
      label: "Manage Cards",
      href: "#",
      icon: "fa-solid fa-address-card",
      chevron: true,
    },
    {
      key: "update-licenses",
      label: "Update Licenses & Sign",
      href: "#",
      icon: "fa-solid fa-file-signature",
    },
    {
      key: "update-status",
      label: "Update Status",
      href: "#",
      icon: "fa-solid fa-arrows-rotate",
    },
    {
      key: "ba-kit",
      label: "BA Kit",
      href: "#",
      icon: "fa-solid fa-briefcase",
      chevron: true,
    },
    {
      key: "reports",
      label: "Reports",
      href: "#",
      icon: "fa-solid fa-chart-line",
    },
    {
      key: "360-reports",
      label: "360 Reports",
      href: "#",
      icon: "fa-solid fa-chart-pie",
    },
  ];

  var FOOTER_NAV_ITEMS = [
    {
      key: "settings",
      label: "Settings",
      href: "#",
      icon: "fa-solid fa-sliders",
    },
    {
      key: "logout",
      label: "Logout",
      href: "#",
      icon: "fa-solid fa-arrow-right-from-bracket",
    },
  ];

  function sidebarNavItemHtml(item, activeKey) {
    var isActive = item.key === activeKey;

    return (
      '<a class="tp-sidebar__link' +
      (isActive ? " is-active" : "") +
      '" href="' +
      item.href +
      '" data-key="' +
      item.key +
      '">' +
      '<i class="' +
      item.icon +
      '"></i>' +
      '<span class="tp-sidebar__link-label">' +
      item.label +
      "</span>" +
      (item.chevron
        ? '<span class="tp-sidebar__link-chevron"><i class="fa-solid fa-chevron-right"></i></span>'
        : "") +
      "</a>"
    );
  }

  function renderSidebar($el) {
    var active = $el.data("active") || "";
    var collapsed = localStorage.getItem("bams-sidebar-collapsed") === "true";

    var html =
      '<div class="tp-sidebar' +
      (collapsed ? " is-collapsed" : "") +
      '">' +
      '<div class="tp-sidebar__inner">' +
      // Brand
      '<div class="tp-sidebar__brand">' +
      '<div class="tp-sidebar__logo">' +
      '<img src="assets/images/D&IT-New-Logo1-white.png" alt="BAMS Logo">' +
      "</div>" +
      '<div class="tp-sidebar__brand-text">' +
      '<div class="tp-sidebar__brand-name">BAMS</div>' +
      '<div class="tp-sidebar__brand-sub">Business Associate Management System</div>' +
      "</div>" +
      '<button class="tp-sidebar__collapse-btn" type="button" aria-label="Toggle sidebar">' +
      '<i class="fa-solid ' +
      (collapsed ? "fa-chevron-right" : "fa-chevron-left") +
      '"></i>' +
      "</button>" +
      "</div>" +
      // Navigation
      '<nav class="tp-sidebar__nav tp-scrollbar">' +
      NAV_ITEMS.map(function (item) {
        return sidebarNavItemHtml(item, active);
      }).join("") +
      "</nav>" +
      // CTA Button
      '<div class="tp-sidebar__nav" style="flex:0;">' +
      '<button class="tp-sidebar__cta" type="button">' +
      '<i class="fa-solid fa-id-badge"></i>' +
      "<span>Issue New Card</span>" +
      "</button>" +
      "</div>" +
      // Footer Navigation
      '<div class="tp-sidebar__footer-nav">' +
      FOOTER_NAV_ITEMS.map(function (item) {
        return sidebarNavItemHtml(item, active);
      }).join("") +
      "</div>" +
      "</div>" +
      "</div>";

    $el.html(html);
    bindSidebarEvents($el);
  }

  function bindSidebarEvents($el) {
    var $root = $el.find(".tp-sidebar");
    var $btn = $el.find(".tp-sidebar__collapse-btn");

    $btn.on("click", function () {
      var isCollapsed = $root
        .toggleClass("is-collapsed")
        .hasClass("is-collapsed");

      $btn.html(
        '<i class="fa-solid ' +
          (isCollapsed ? "fa-chevron-right" : "fa-chevron-left") +
          '"></i>',
      );

      localStorage.setItem("bams-sidebar-collapsed", String(isCollapsed));

      $(".app-shell").toggleClass("is-collapsed", isCollapsed);

      $el.trigger("sidebar:toggle", [isCollapsed]);
    });

    $el.find('.tp-sidebar__link[href="#"]').on("click", function (e) {
      e.preventDefault();
    });
  }

  // =====================================================
  // Header
  // =====================================================
  function renderHeader($el) {
    var placeholder = $el.data("search-placeholder") || "Search...";
    var userName = $el.data("user-name") || "";
    var userSub = $el.data("user-sub") || "";
    var avatar = $el.data("user-avatar") || "";

    var html =
      '<header class="tp-header">' +
      // Search
      '<label class="tp-header__search">' +
      '<i class="fa-solid fa-magnifying-glass"></i>' +
      '<input type="text" placeholder="' +
      placeholder +
      '" aria-label="Search">' +
      "</label>" +
      // Right Side
      '<div class="tp-header__right">' +
      '<button class="tp-header__icon-btn" type="button" aria-label="Notifications">' +
      '<i class="fa-regular fa-bell"></i>' +
      '<span class="tp-dot"></span>' +
      "</button>" +
      '<button class="tp-header__icon-btn" type="button" aria-label="Messages">' +
      '<i class="fa-regular fa-envelope"></i>' +
      "</button>" +
      '<div class="tp-header__divider"></div>' +
      '<div class="tp-header__profile">' +
      '<div class="tp-header__profile-text">' +
      '<div class="name">' +
      userName +
      "</div>" +
      '<div class="org">' +
      userSub +
      "</div>" +
      "</div>" +
      '<div class="tp-header__avatar">' +
      (avatar ? '<img src="' + avatar + '" alt="' + userName + '">' : "") +
      '<span class="tp-online"></span>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</header>";

    $el.html(html);
  }

  // =====================================================
  // Footer
  // =====================================================
  function renderFooter($el) {
    var year = $el.data("year") || new Date().getFullYear();
    var text =
      $el.data("text") ||
      "© " +
        year +
        ", BA Management ID Card Portal. All Rights Reserved. Confidential Data. Powered by D&IT (T&D) Shared Services";

    $el.html('<div class="tp-footer">' + text + "</div>");
  }

  // =====================================================
  // Init
  // =====================================================
  $(function () {
    var $sidebar = $("#sidebar-placeholder");
    var $header = $("#header-placeholder");
    var $footer = $("#footer-placeholder");

    if ($sidebar.length) renderSidebar($sidebar);
    if ($header.length) renderHeader($header);
    if ($footer.length) renderFooter($footer);
  });
})(jQuery);