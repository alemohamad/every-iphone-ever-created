// Product line filter, compare mode, year navigation, previous / next arrows and links to a model
(function () {
  var grid = document.querySelector('.devices-grid');
  var years = Array.prototype.slice.call(document.querySelectorAll('.year-nav-year'));
  var yearStrip = document.querySelector('.year-nav-years');
  var arrows = document.querySelectorAll('.year-nav-arrow');
  var lineOptions = Array.prototype.slice.call(document.querySelectorAll('.line-filter-option'));
  var compareBar = document.querySelector('.compare-bar');
  var compareShow = document.querySelector('.compare-show');
  var compareClear = document.querySelector('.compare-clear');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Each model is a header followed by its spec cells, all direct children of the grid
  var models = [];
  Array.prototype.forEach.call(grid.children, function (element) {
    if (element.classList.contains('model-header')) {
      models.push({
        id: element.id,
        year: element.getAttribute('data-year'),
        line: element.getAttribute('data-line'),
        header: element,
        toggle: element.querySelector('.compare-toggle'),
        cells: []
      });
    }
    models[models.length - 1].cells.push(element);
  });

  var state = { line: 'all', selected: [], comparing: false };

  function isVisible(model) {
    if (state.comparing) return state.selected.indexOf(model.id) !== -1;
    return state.line === 'all' || model.line === state.line;
  }

  function visibleModels() {
    return models.filter(isVisible);
  }

  function findModel(id) {
    return models.filter(function (model) { return model.id === id; })[0];
  }

  // Signature of a spec cell, used to fade the rows that are identical while comparing
  function cellSignature(cell) {
    var images = Array.prototype.map.call(cell.querySelectorAll('img'), function (img) {
      return img.getAttribute('src');
    });
    return cell.textContent.replace(/\s+/g, ' ').trim() + '|' + images.join(',');
  }

  function saveToUrl() {
    var params = new URLSearchParams(window.location.search);
    params.delete('line');
    params.delete('compare');
    if (state.comparing) params.set('compare', state.selected.join(','));
    else if (state.line !== 'all') params.set('line', state.line);
    // Keep the commas readable in shared links (?compare=iphone-17,iphone-16)
    var query = params.toString().replace(/%2C/g, ',');
    history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
  }

  function render() {
    var visible = visibleModels();
    models.forEach(function (model) {
      var shown = isVisible(model);
      model.cells.forEach(function (cell) {
        cell.classList.toggle('is-filtered-out', !shown);
        cell.classList.remove('is-same');
      });
      var selected = state.selected.indexOf(model.id) !== -1;
      model.toggle.setAttribute('aria-pressed', String(selected));
    });

    // Rows after the photo and colors that read the same for every compared model
    if (state.comparing && visible.length > 1) {
      for (var row = 3; row < visible[0].cells.length; row++) {
        var first = cellSignature(visible[0].cells[row]);
        var same = visible.every(function (model) {
          return model.cells[row] && cellSignature(model.cells[row]) === first;
        });
        if (same) visible.forEach(function (model) { model.cells[row].classList.add('is-same'); });
      }
    }
    document.body.classList.toggle('is-comparing', state.comparing);

    lineOptions.forEach(function (option) {
      option.setAttribute('aria-pressed', String(!state.comparing && option.getAttribute('data-line') === state.line));
    });

    years.forEach(function (link) {
      var year = link.getAttribute('data-year');
      link.classList.toggle('is-filtered-out', !visible.some(function (model) { return model.year === year; }));
    });

    var count = state.selected.length;
    compareBar.hidden = count === 0;
    if (state.comparing) {
      compareShow.textContent = 'Show all';
      compareShow.disabled = false;
    } else {
      compareShow.textContent = count < 2 ? 'Pick one more to compare' : 'Compare ' + count;
      compareShow.disabled = count < 2;
    }

    saveToUrl();
    update();
  }

  function setLine(line) {
    state.line = line;
    state.comparing = false;
    render();
    window.scrollTo({ left: 0, behavior: 'auto' });
  }

  function setComparing(comparing) {
    state.comparing = comparing;
    render();
    window.scrollTo({ left: 0, behavior: 'auto' });
  }

  lineOptions.forEach(function (option) {
    option.addEventListener('click', function () {
      setLine(option.getAttribute('data-line'));
    });
  });

  models.forEach(function (model) {
    model.toggle.addEventListener('click', function () {
      var index = state.selected.indexOf(model.id);
      if (index === -1) state.selected.push(model.id);
      else state.selected.splice(index, 1);
      // Keep the picks in timeline order
      state.selected = models.map(function (m) { return m.id; }).filter(function (id) {
        return state.selected.indexOf(id) !== -1;
      });
      if (state.comparing && state.selected.length === 0) state.comparing = false;
      render();
    });
  });

  compareShow.addEventListener('click', function () {
    setComparing(!state.comparing);
  });

  compareClear.addEventListener('click', function () {
    state.selected = [];
    setComparing(false);
  });

  // Distance between the page's left edge and the first column
  function gutter() {
    return parseFloat(getComputedStyle(grid).paddingLeft) || 0;
  }

  // Horizontal scroll position that lines a model's column up with the left edge
  function columnLeft(header) {
    return header.getBoundingClientRect().left + window.scrollX - gutter();
  }

  function maxScrollX() {
    return document.documentElement.scrollWidth - window.innerWidth;
  }

  // Index (among visible models) of the one whose column is at the left edge
  function currentIndex(visible) {
    var edge = window.scrollX + gutter();
    var index = 0;
    visible.forEach(function (model, i) {
      if (model.header.getBoundingClientRect().left + window.scrollX <= edge + 2) index = i;
    });
    return index;
  }

  // The last few models can't reach the left edge, so after jumping to one of them
  // its year stays highlighted until the page is scrolled away from where it landed
  var pinned = null;

  // Scroll sideways to a model, keeping the vertical position so a row can be compared
  function scrollToModel(model, smooth) {
    var left = columnLeft(model.header);
    pinned = { model: model, x: Math.min(left, maxScrollX()), arrived: false };
    window.scrollTo({ left: left, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
    // Already in place (e.g. at the end of the page): no scroll event will fire
    update();
  }

  function activeModel(visible) {
    if (pinned && visible.indexOf(pinned.model) !== -1) {
      var distance = Math.abs(window.scrollX - pinned.x);
      if (distance <= 2) pinned.arrived = true;
      else if (pinned.arrived) pinned = null;
      if (pinned && pinned.arrived) return pinned.model;
    }
    return visible[currentIndex(visible)];
  }

  function update() {
    var visible = visibleModels();
    var active = visible.length ? activeModel(visible) : null;
    var year = active ? active.year : null;
    years.forEach(function (link) {
      var isActive = link.getAttribute('data-year') === year;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
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
    arrows[0].disabled = window.scrollX <= 2;
    arrows[1].disabled = window.scrollX >= maxScrollX() - 2;
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
      var visible = visibleModels();
      if (!visible.length) return;
      var direction = Number(arrow.getAttribute('data-direction'));
      var index = currentIndex(visible);
      // When the current column is only partly scrolled past, "previous" snaps back to it
      var aligned = Math.abs(columnLeft(visible[index].header) - window.scrollX) < 2;
      var target = direction > 0 ? index + 1 : (aligned ? index - 1 : index);
      target = Math.max(0, Math.min(visible.length - 1, target));
      scrollToModel(visible[target], true);
    });
  });

  // Show a model that the filter or comparison is hiding by going back to all models
  function reveal(model) {
    if (isVisible(model)) return;
    state.line = 'all';
    state.comparing = false;
    render();
  }

  // Year links and model names point at #model-id: scroll sideways instead of jumping.
  // Runs in the capture phase so Webflow's anchor handler (which scrolls vertically
  // and resets the horizontal position) never sees these clicks.
  window.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;
    var model = findModel(link.getAttribute('href').slice(1));
    if (!model) return;
    event.preventDefault();
    event.stopPropagation();
    // A year link goes to that year's first model still shown by the filter
    if (link.classList.contains('year-nav-year')) {
      model = visibleModels().filter(function (m) { return m.year === link.getAttribute('data-year'); })[0] || model;
    }
    reveal(model);
    history.replaceState(null, '', window.location.pathname + window.location.search + '#' + model.id);
    scrollToModel(model, true);
  }, true);

  function scrollToHash() {
    var model = window.location.hash && findModel(window.location.hash.slice(1));
    if (!model) return;
    reveal(model);
    window.scrollTo({ top: 0, left: columnLeft(model.header), behavior: 'auto' });
  }

  // Restore the filter or comparison from the URL (?line=pro or ?compare=a,b)
  var params = new URLSearchParams(window.location.search);
  var compareIds = (params.get('compare') || '').split(',').filter(findModel);
  if (compareIds.length > 1) {
    state.selected = models.map(function (m) { return m.id; }).filter(function (id) {
      return compareIds.indexOf(id) !== -1;
    });
    state.comparing = true;
  } else if (lineOptions.some(function (option) { return option.getAttribute('data-line') === params.get('line'); })) {
    state.line = params.get('line');
  }

  window.addEventListener('hashchange', scrollToHash);
  window.addEventListener('load', function () {
    scrollToHash();
    update();
  });
  render();
})();
