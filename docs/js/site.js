// Year navigation, previous / next arrows and links to a model
(function () {
  var grid = document.querySelector('.devices-grid');
  var headers = Array.prototype.slice.call(document.querySelectorAll('.model-header'));
  var years = Array.prototype.slice.call(document.querySelectorAll('.year-nav-year'));
  var yearStrip = document.querySelector('.year-nav-years');
  var arrows = document.querySelectorAll('.year-nav-arrow');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Distance between the page's left edge and the first column
  function gutter() {
    return parseFloat(getComputedStyle(grid).paddingLeft) || 0;
  }

  // Horizontal scroll position that lines a model's column up with the left edge
  function columnLeft(header) {
    return header.getBoundingClientRect().left + window.scrollX - gutter();
  }

  // Index of the model whose column is currently at the left edge
  function currentIndex() {
    var edge = window.scrollX + gutter();
    var index = 0;
    headers.forEach(function (header, i) {
      if (header.getBoundingClientRect().left + window.scrollX <= edge + 2) index = i;
    });
    return index;
  }

  function maxScrollX() {
    return document.documentElement.scrollWidth - window.innerWidth;
  }

  // The last few models can't reach the left edge, so after jumping to one of them
  // its year stays highlighted until the page is scrolled away from where it landed
  var pinned = null;

  // Scroll sideways to a model, keeping the vertical position so a row can be compared
  function scrollToModel(header, smooth) {
    var left = columnLeft(header);
    pinned = { header: header, x: Math.min(left, maxScrollX()), arrived: false };
    window.scrollTo({ left: left, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
    // Already in place (e.g. at the end of the page): no scroll event will fire
    update();
  }

  function activeHeader() {
    if (pinned) {
      var distance = Math.abs(window.scrollX - pinned.x);
      if (distance <= 2) pinned.arrived = true;
      else if (pinned.arrived) pinned = null;
      if (pinned && pinned.arrived) return pinned.header;
    }
    return headers[currentIndex()];
  }

  function update() {
    var year = activeHeader().getAttribute('data-year');
    years.forEach(function (link) {
      var active = link.getAttribute('data-year') === year;
      link.classList.toggle('is-active', active);
      if (active) {
        link.setAttribute('aria-current', 'true');
        // Keep the active year visible when the strip is narrower than all the years
        var linkLeft = link.offsetLeft - yearStrip.offsetLeft;
        if (linkLeft < yearStrip.scrollLeft || linkLeft + link.offsetWidth > yearStrip.scrollLeft + yearStrip.clientWidth) {
          yearStrip.scrollLeft = linkLeft - (yearStrip.clientWidth - link.offsetWidth) / 2;
        }
      } else {
        link.removeAttribute('aria-current');
      }
    });
    var atEnd = window.scrollX + window.innerWidth >= document.documentElement.scrollWidth - 2;
    arrows[0].disabled = window.scrollX <= 2;
    arrows[1].disabled = atEnd;
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      update();
    });
  }, { passive: true });
  window.addEventListener('resize', update);

  Array.prototype.forEach.call(arrows, function (arrow) {
    arrow.addEventListener('click', function () {
      var direction = Number(arrow.getAttribute('data-direction'));
      var index = currentIndex();
      // When the current column is only partly scrolled past, "previous" snaps back to it
      var aligned = Math.abs(columnLeft(headers[index]) - window.scrollX) < 2;
      var target = direction > 0 ? index + 1 : (aligned ? index - 1 : index);
      target = Math.max(0, Math.min(headers.length - 1, target));
      scrollToModel(headers[target], true);
    });
  });

  // Year links and model names point at #model-id: scroll sideways instead of jumping.
  // Runs in the capture phase so Webflow's anchor handler (which scrolls vertically
  // and resets the horizontal position) never sees these clicks.
  window.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;
    var header = document.getElementById(link.getAttribute('href').slice(1));
    if (!header) return;
    event.preventDefault();
    event.stopPropagation();
    history.replaceState(null, '', '#' + header.id);
    scrollToModel(header, true);
  }, true);

  function scrollToHash() {
    var header = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (!header) return;
    window.scrollTo({ top: 0, left: columnLeft(header), behavior: 'auto' });
  }
  window.addEventListener('hashchange', scrollToHash);
  window.addEventListener('load', function () {
    scrollToHash();
    update();
  });
  update();
})();
