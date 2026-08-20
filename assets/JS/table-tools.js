/**
 * table-tools.js
 * ==================================================================
 * A small, dependency-light jQuery enhancer that bolts four common
 * "data-grid" behaviours onto an ordinary HTML <table>:
 *
 *      1. SEARCH            – live, case-insensitive filtering
 *      2. SORTING           – click a column header to sort
 *      3. EXPORT TO EXCEL   – download the (filtered) rows as .xlsx / .csv
 *      4. PAGINATION        – page navigation + "rows per page"
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The portal has many tables spread across several pages. Without this,
 * each table would need its own copy-pasted search/sort/export/paging
 * code. Instead every table shares this ONE implementation, so a new
 * table only needs its id passed in — nothing else to wire up.
 *
 * ------------------------------------------------------------------
 * ENABLING IT (three equivalent ways)
 * ------------------------------------------------------------------
 *   TableTools('#myTable');                     // programmatic (recommended)
 *   $('#myTable').tableTools();                  // jQuery-plugin form
 *   <table id="myTable" data-table-tools>...     // zero-JS auto-init
 *
 * ------------------------------------------------------------------
 * TURNING FEATURES ON / OFF PER TABLE  (this is the "individual control")
 * ------------------------------------------------------------------
 * Every feature is an INDEPENDENT switch — mix and match per table.
 *
 *   // via JS options — e.g. a read-only table: sort + paginate only
 *   TableTools('#report', { search: false, exportExcel: false });
 *
 *   // search box only, no paging / sort / export
 *   TableTools('#miniList', { sort: false, pagination: false, exportExcel: false });
 *
 *   // via HTML data-attributes — no JS needed at all
 *   <table id="t1" data-table-tools
 *          data-search="true"
 *          data-sort="true"
 *          data-export="false"
 *          data-pagination="true"
 *          data-page-size="15"
 *          data-page-sizes="8,16,24,50"
 *          data-export-name="my-report"
 *          data-search-input="#pane .the-search"     (reuse existing control)
 *          data-export-button="#pane .the-export">   (reuse existing control)
 *
 * Data-attributes win over JS options, which win over the built-in
 * defaults — so a page author can override a shared init from the markup.
 *
 * ------------------------------------------------------------------
 * ALL OPTIONS (every one is optional)
 * ------------------------------------------------------------------
 *   search         {boolean}  turn the search box on/off       (default true)
 *   sort           {boolean}  turn click-to-sort on/off        (default true)
 *   exportExcel    {boolean}  turn "Export to Excel" on/off    (default true)
 *   pagination     {boolean}  turn paging on/off               (default true)
 *   pageSize       {number}   rows per page                    (default 10)
 *   pageSizes      {number[]} choices in the "rows per page"   (default [5,10,15,20,25,50])
 *   exportFileName {string}   download name, no extension      (default table id)
 *   searchInput    {selector} reuse an EXISTING input instead of building one
 *   exportButton   {selector} reuse an EXISTING button instead of building one
 *
 * ------------------------------------------------------------------
 * PER-COLUMN CONTROL  (set on individual <th> in the <thead>)
 * ------------------------------------------------------------------
 *   <th data-no-sort>     this column can't be sorted (no click / no caret)
 *   <th data-no-export>   this column is left out of the Excel/CSV download
 *   <th data-exclude>     shorthand — excluded from BOTH sort and export
 *   <th data-sticky>      FREEZE this column — it stays pinned to the left
 *                         while the remaining columns scroll horizontally.
 *                         Mark the leftmost N columns to freeze a block.
 *
 *   <thead>
 *     <tr>
 *       <th>Employee</th>                 <!-- sortable + exported        -->
 *       <th data-no-sort>Skills</th>      <!-- exported, but not sortable -->
 *       <th data-exclude>Action</th>      <!-- ignored by sort AND export -->
 *     </tr>
 *   </thead>
 *
 * Excel export uses SheetJS (window.XLSX) when it is present -> real .xlsx;
 * if SheetJS is missing it degrades to a UTF-8 CSV that Excel opens cleanly.
 * All visual styling lives in assets/CSS/table-tools.css (themed via SCSS
 * variables); this file only adds behaviour + class hooks.
 * ==================================================================
 */
(function ($) {
    "use strict";

    // Marker stored on a <table> once initialised. Needed so that calling
    // TableTools twice on the same table (e.g. a shared loop + a page script)
    // can't wire duplicate toolbars / double event handlers.
    var DATA_KEY = "tableToolsBound";

    // The out-of-the-box behaviour. Everything is ON by default because the
    // common case is "give me the full grid"; callers opt OUT of what they
    // don't want. These are cloned per table (never mutated) in initOne().
    var DEFAULTS = {
        pageSize: 10,
        pageSizes: [5, 10, 15, 20, 25, 50],
        search: true,
        sort: true,
        exportExcel: true,
        pagination: true,
        exportFileName: null,
        searchInput: null,
        exportButton: null
    };

    // Is a boolean opt-out attribute present (and not explicitly "false")?
    // Used for the per-column <th> switches, so columns can be excluded from
    // sorting/export right in the markup: <th data-no-sort>, <th data-no-export>.
    function flag($el, name) {
        var v = $el.attr(name);
        return v !== undefined && v !== "false";
    }

    // A <th> can opt a whole column out of sorting and/or export:
    //   data-no-sort    -> not clickable / never sorted
    //   data-no-export  -> skipped in the downloaded file
    //   data-exclude    -> shorthand for BOTH of the above
    function thNoSort($th) { return flag($th, "data-exclude") || flag($th, "data-no-sort"); }
    function thNoExport($th) { return flag($th, "data-exclude") || flag($th, "data-no-export"); }

    // ==============================================================
    //  READING A CELL'S VALUE
    //  Why: search, sort and export must all agree on "what is the
    //  text of this cell?". Many cells aren't plain text — they hold
    //  <select>s, radios or <input>s (this portal's planning tables do).
    //  A naive $td.text() would return "" for a dropdown. This helper
    //  returns the *meaningful* value so all three features stay correct.
    // ==============================================================
    function cellValue($td) {
        // Radio / checkbox group -> use the label of whatever is checked
        // (e.g. the "Yes"/"No" replacement toggles), so search/export show
        // the human-readable choice rather than an internal value.
        var $checked = $td.find("input:checked");
        if ($checked.length) {
            var lbl = $td.find("label[for='" + $checked.attr("id") + "']").text();
            return (lbl || $checked.val() || "").toString().trim();
        }
        // A <select> reads as its selected option's text; a text/number
        // input reads as its current value. This keeps user-typed data
        // searchable and exportable.
        var $ctrl = $td.find("select, input, textarea").first();
        if ($ctrl.length) {
            if ($ctrl.is("select")) {
                return ($ctrl.find("option:selected").text() || "").trim();
            }
            if (!$ctrl.is(":checkbox, :radio")) {
                return ($ctrl.val() || "").toString().trim();
            }
        }
        // Plain cell: collapse whitespace so multi-line markup compares cleanly.
        return $td.text().replace(/\s+/g, " ").trim();
    }

    // Does a row contain the search query in ANY column?
    // Why a helper: keeps the search filter in one place and reuses the
    // same cellValue() logic so filtering matches what the user sees.
    function rowMatches(tr, query) {
        if (!query) return true;
        return $(tr).children("td").filter(function () {
            return cellValue($(this)).toLowerCase().indexOf(query) !== -1;
        }).length > 0;
    }

    // Numeric-aware comparison for sorting.
    // Why: string sort would order "10" before "9" and "₹1,200" oddly.
    // We strip non-numeric characters; if BOTH cells look numeric we compare
    // as numbers, otherwise fall back to a locale string compare (so "Amit"
    // vs "amit" and "Row 2" vs "Row 10" sort the way a human expects).
    function compareValues(a, b) {
        var na = parseFloat(a.replace(/[^0-9.\-]/g, ""));
        var nb = parseFloat(b.replace(/[^0-9.\-]/g, ""));
        var aNum = a !== "" && !isNaN(na);
        var bNum = b !== "" && !isNaN(nb);
        if (aNum && bNum) return na - nb;
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    }

    // ==============================================================
    //  EXPORT TO EXCEL
    //  Why it exports state.filtered (not all rows): users expect the
    //  download to reflect what they searched/sorted, across ALL pages
    //  (not just the visible page). Headers come from <thead>.
    // ==============================================================
    function exportData(state) {
        var $ths = state.$thead.find("th");

        // Column indexes to KEEP — drop any <th data-no-export>/<th data-exclude>.
        var keep = [];
        $ths.each(function (i) {
            if (!thNoExport($(this))) keep.push(i);
        });

        var headers = keep.map(function (i) {
            return $ths.eq(i).text().replace(/\s+/g, " ").trim();
        });

        var rows = state.filtered.map(function (tr) {
            var $tds = $(tr).children("td");
            return keep.map(function (i) { return cellValue($tds.eq(i)); });
        });

        var fileName = (state.opts.exportFileName || state.id || "table");

        // Preferred path: SheetJS produces a genuine .xlsx with no warnings.
        if (window.XLSX) {
            var aoa = [headers].concat(rows);
            var ws = XLSX.utils.aoa_to_sheet(aoa);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, fileName + ".xlsx");
            return;
        }

        // Fallback when SheetJS isn't loaded: build a UTF-8 CSV by hand.
        // The BOM (﻿) makes Excel read non-ASCII (names, ₹) correctly.
        var esc = function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; };
        var csv = [headers.map(esc).join(",")]
            .concat(rows.map(function (r) { return r.map(esc).join(","); }))
            .join("\r\n");
        var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = fileName + ".csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ==============================================================
    //  PAGINATION HELPERS
    // ==============================================================

    // Build the compact list of page numbers to show, e.g. for page 7 of 20:
    //   1 … 6 7 8 … 20
    // Why: rendering a button for every page is unusable at 100+ pages.
    // "…" markers stand in for the collapsed ranges.
    function pageNumbers(current, total) {
        var out = [];
        var add = function (n) { if (out.indexOf(n) === -1) out.push(n); };
        add(1);                                   // always show first page
        for (var i = current - 1; i <= current + 1; i++) {
            if (i > 1 && i < total) add(i);       // current and its neighbours
        }
        if (total > 1) add(total);                // always show last page
        out.sort(function (a, b) { return a - b; });

        // Insert an ellipsis wherever there's a gap between shown pages.
        var withGaps = [];
        for (var j = 0; j < out.length; j++) {
            if (j > 0 && out[j] - out[j - 1] > 1) withGaps.push("…");
            withGaps.push(out[j]);
        }
        return withGaps;
    }

    // ==============================================================
    //  RENDER — the single source of truth for what the table shows.
    //  Every action (search, sort, page change, page-size change) ends
    //  by calling render(), so the visible rows, the "Showing X–Y of Z"
    //  text and the page buttons can never drift out of sync.
    // ==============================================================
    function render(state) {
        var opts = state.opts;
        var total = state.filtered.length;

        // When pagination is OFF, show every filtered row on one "page".
        var pageSize = opts.pagination ? state.pageSize : total || 1;
        var pages = Math.max(1, Math.ceil(total / pageSize));

        // Clamp the current page — e.g. after a search shrinks the result set
        // the old page number may no longer exist.
        if (state.page > pages) state.page = pages;
        if (state.page < 1) state.page = 1;

        var start = (state.page - 1) * pageSize;
        var end = start + pageSize;

        // Show only this page's slice; hide the rest. We toggle inline display
        // (rather than detaching nodes) so <input>/<select> state inside rows
        // is preserved when the user pages away and back.
        state.rows.forEach(function (tr) { tr.style.display = "none"; });
        state.filtered.slice(start, end).forEach(function (tr) { tr.style.display = ""; });

        // Empty state: give feedback when a search matches nothing, instead of
        // a blank table. Removed/re-added each render so it never lingers.
        state.$emptyRow.remove();
        if (total === 0) {
            state.$emptyRow = $("<tr class='tt-empty'><td colspan='" +
                Math.max(1, state.colCount) + "'>No matching records found</td></tr>");
            state.$tbody.append(state.$emptyRow);
        }

        // "Showing 1–10 of 42 records" — only exists when pagination is on.
        if (state.$info) {
            var from = total === 0 ? 0 : start + 1;
            var to = Math.min(end, total);
            state.$info.text("Showing " + from + "–" + to + " of " + total + " records");
        }

        // Rebuild the page buttons from scratch each render — simplest way to
        // keep the active page, disabled arrows and ellipses correct.
        if (state.$pagination) {
            state.$pagination.empty();
            var mkBtn = function (label, page, opt) {
                opt = opt || {};
                var $li = $("<li>");
                var $b = $("<button type='button'>").html(label);
                if (opt.active) $b.addClass("tt-active");
                if (opt.disabled) $b.prop("disabled", true);
                if (!opt.disabled && !opt.gap) {
                    $b.on("click", function () { state.page = page; render(state); });
                }
                if (opt.gap) $b.prop("disabled", true); // the "…" placeholder
                return $li.append($b);
            };
            state.$pagination.append(mkBtn("&laquo;", state.page - 1, { disabled: state.page === 1 }));
            pageNumbers(state.page, pages).forEach(function (p) {
                if (p === "…") state.$pagination.append(mkBtn("&hellip;", 0, { gap: true }));
                else state.$pagination.append(mkBtn(String(p), p, { active: p === state.page }));
            });
            state.$pagination.append(mkBtn("&raquo;", state.page + 1, { disabled: state.page === pages }));
        }
    }

    // Recompute the filtered set from the search query, then render.
    // Why separate from render(): searching changes WHICH rows exist;
    // paging only changes which existing rows are visible.
    function recompute(state) {
        var q = (state.query || "").toLowerCase().trim();
        state.filtered = q
            ? state.rows.filter(function (tr) { return rowMatches(tr, q); })
            : state.rows.slice();
        render(state);
    }

    // Sort by a column, toggling asc -> desc on repeat clicks of the same header.
    // We physically reorder the row nodes in the DOM (append in sorted order)
    // so pagination's slice() stays a simple, correct window over state.rows.
    function sortBy(state, colIndex) {
        if (state.sortCol === colIndex) {
            state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
            state.sortCol = colIndex;
            state.sortDir = "asc";
        }
        var dir = state.sortDir === "asc" ? 1 : -1;
        state.rows.sort(function (a, b) {
            var av = cellValue($(a).children("td").eq(colIndex));
            var bv = cellValue($(b).children("td").eq(colIndex));
            return compareValues(av, bv) * dir;
        });
        state.rows.forEach(function (tr) { state.$tbody.append(tr); });

        // Update the caret shown on the active header (styled in the CSS).
        state.$thead.find("th").removeClass("tt-asc tt-desc");
        state.$thead.find("th").eq(colIndex)
            .addClass(state.sortDir === "asc" ? "tt-asc" : "tt-desc");

        state.page = 1;          // jump back to page 1 after a re-sort
        recompute(state);
    }

    // ==============================================================
    //  BUILD / WIRE THE UI
    //  This is where the per-feature switches actually take effect: each
    //  block is guarded by its option, so a disabled feature simply never
    //  gets built or bound.
    // ==============================================================
    function buildUI(state) {
        var opts = state.opts;
        var $table = state.$table;

        // Anchor = the scroll wrapper if there is one, else the table itself.
        // The toolbar is inserted before it and the footer after it, so both
        // sit outside the horizontal scroll area.
        var $anchor = $table.closest(".table-responsive");
        if (!$anchor.length) $anchor = $table;

        // ---------- toolbar: search box + export button ----------
        // Reuse an existing control if the caller pointed us at one
        // (the dashboard2 tables already ship their own search + export).
        var $searchInput = opts.searchInput ? $(opts.searchInput).first() : $();
        var $exportBtn = opts.exportButton ? $(opts.exportButton).first() : $();

        // Only build a toolbar if a wanted control isn't being reused —
        // this prevents duplicate search boxes / export buttons.
        var needToolbar =
            (opts.search && !$searchInput.length) ||
            (opts.exportExcel && !$exportBtn.length);

        if (needToolbar) {
            var $toolbar = $("<div class='tt-toolbar'>");
            if (opts.search && !$searchInput.length) {
                $searchInput = $("<input type='text' class='form-control form-control-sm tt-search' " +
                    "placeholder='Search...' aria-label='Search table'>");
                $toolbar.append($searchInput);
            }
            $toolbar.append("<span class='tt-spacer'></span>"); // pushes export to the right
            if (opts.exportExcel && !$exportBtn.length) {
                $exportBtn = $("<button type='button' class='btn btn-sm btn-success tt-export'>" +
                    "<i class='fa-solid fa-file-excel'></i> Export to Excel</button>");
                $toolbar.append($exportBtn);
            }
            $anchor.before($toolbar);
        }

        // Bind behaviour only for features that are enabled AND have a control.
        if (opts.search && $searchInput.length) {
            $searchInput.on("input", function () {
                state.query = this.value;
                state.page = 1;              // new search -> back to first page
                recompute(state);
            });
        }
        if (opts.exportExcel && $exportBtn.length) {
            $exportBtn.on("click", function (e) {
                e.preventDefault();
                exportData(state);
            });
        }

        // ---------- footer: record info + rows-per-page + page buttons ----------
        // Built only when pagination is enabled. state.$info / state.$pagination
        // stay null otherwise, which render() already checks for.
        if (opts.pagination) {
            var $footer = $("<div class='tt-footer'>");
            var $left = $("<div class='d-flex align-items-center gap-3 flex-wrap'>");

            state.$info = $("<div class='tt-info'>");
            $left.append(state.$info);

            var $sizeWrap = $("<label class='tt-pagesize'>Rows per page:</label>");
            var $size = $("<select class='form-select form-select-sm'>");
            opts.pageSizes.forEach(function (n) {
                $size.append($("<option>").val(n).text(n).prop("selected", n === opts.pageSize));
            });
            $size.on("change", function () {
                state.pageSize = parseInt(this.value, 10) || opts.pageSize;
                state.page = 1;
                render(state);
            });
            $sizeWrap.append($size);
            $left.append($sizeWrap);

            state.$pagination = $("<ul class='tt-pagination pagination-tt'>");

            $footer.append($left).append(state.$pagination);
            $anchor.after($footer);
        }

        // ---------- sortable headers ----------
        // Adds the pointer/caret class and click handler per <th> — but skips
        // any column the markup opted out with <th data-no-sort> / data-exclude
        // (e.g. the radio / dropdown / free-text columns that don't sort well).
        if (opts.sort) {
            state.$thead.find("th").each(function (i) {
                var $th = $(this);
                if (thNoSort($th)) return; // leave this column unsorted
                $th.addClass("tt-sortable").on("click", function () {
                    sortBy(state, i);
                });
            });
        }
    }

    // ==============================================================
    //  FROZEN / STICKY COLUMNS
    //  A <th data-sticky> pins its whole column (header + every body cell)
    //  to the left while the remaining columns scroll horizontally underneath.
    //  We tag those cells with .tt-sticky (CSS makes them position:sticky) and
    //  set each one's `left` offset to the summed width of the frozen columns
    //  to its left — so several adjacent frozen columns stack correctly.
    // ==============================================================
    function setupSticky(state) {
        var $ths = state.$thead.find("th");
        var stickyCols = [];
        $ths.each(function (i) {
            if (flag($(this), "data-sticky")) stickyCols.push(i);
        });
        if (!stickyCols.length) return;

        // position:sticky only works inside a scrolling ancestor. This project's
        // bootstrap build doesn't give .table-responsive an overflow, so the
        // frozen column would have nothing to stick to — mark the wrapper as a
        // scroll container (see .tt-sticky-wrap in table-tools.css).
        var $wrap = state.$table.closest(".table-responsive");
        if (!$wrap.length) $wrap = state.$table.parent();
        $wrap.addClass("tt-sticky-wrap");

        // Tag the header + every body cell in each frozen column once.
        stickyCols.forEach(function (col) {
            $ths.eq(col).addClass("tt-sticky");
            state.rows.forEach(function (tr) {
                $(tr).children("td").eq(col).addClass("tt-sticky");
            });
        });
        // Mark the rightmost frozen column so CSS can draw the divider shadow.
        var lastCol = stickyCols[stickyCols.length - 1];
        $ths.eq(lastCol).addClass("tt-sticky-edge");
        state.rows.forEach(function (tr) {
            $(tr).children("td").eq(lastCol).addClass("tt-sticky-edge");
        });

        // Compute & apply the cumulative left offsets from the rendered widths.
        function position() {
            var left = 0;
            stickyCols.forEach(function (col) {
                var px = left + "px";
                $ths.eq(col).css("left", px);
                state.rows.forEach(function (tr) {
                    $(tr).children("td").eq(col).css("left", px);
                });
                left += $ths.eq(col).outerWidth() || 0;
            });
        }
        position();

        // Widths aren't known while a table sits in a hidden tab (offsetWidth 0),
        // and they change on resize — so recompute when either happens.
        $(window).on("resize", position);
        if (window.ResizeObserver) {
            new ResizeObserver(position).observe(state.$table[0]);
        }
    }

    // ==============================================================
    //  INIT ONE TABLE
    //  Merges the options, snapshots the rows, builds a per-table `state`
    //  object (its private memory), wires the UI and does the first render.
    // ==============================================================
    function initOne(table, options) {
        var $table = $(table);
        if (!$table.length || $table.data(DATA_KEY)) return; // guard double-init
        $table.data(DATA_KEY, true);

        // Precedence: defaults < JS options < HTML data-attributes.
        // dataOptions() comes last so page markup can override a shared init.
        var opts = $.extend({}, DEFAULTS, options, dataOptions($table));

        var $tbody = $table.children("tbody").first();
        if (!$tbody.length) $tbody = $table.find("tbody").first();
        var $thead = $table.children("thead").first();
        if (!$thead.length) $thead = $table.find("thead").first();

        // `state` is everything this table needs to remember between actions.
        // Keeping it in one object (instead of globals) is what lets many
        // tables run independently on the same page.
        var state = {
            id: $table.attr("id") || "",
            $table: $table,
            $tbody: $tbody,
            $thead: $thead,
            opts: opts,
            rows: $tbody.children("tr").get(), // the master row list (original order)
            filtered: [],                      // rows passing the current search
            page: 1,
            pageSize: opts.pageSize,
            sortCol: null,
            sortDir: null,
            query: "",
            colCount: $thead.find("th").length,
            $info: null,
            $pagination: null,
            $emptyRow: $()
        };

        buildUI(state);
        setupSticky(state);
        recompute(state);

        // Expose state so page code can inspect/extend it if ever needed.
        $table.data("tableToolsState", state);
    }

    // Read per-feature switches straight off the <table>'s data-attributes.
    // jQuery's .data() already coerces "false"/"true"/numbers, but we also
    // accept the string "false" defensively. This is what makes the pure-HTML,
    // no-JS control path work.
    function dataOptions($table) {
        var o = {};
        var d = $table.data();
        if (d.pageSize != null) o.pageSize = parseInt(d.pageSize, 10);
        if (d.pageSizes != null) {
            o.pageSizes = String(d.pageSizes).split(",")
                .map(function (n) { return parseInt(n, 10); })
                .filter(function (n) { return !isNaN(n); });
        }
        if (d.search != null) o.search = d.search !== false && d.search !== "false";
        if (d.sort != null) o.sort = d.sort !== false && d.sort !== "false";
        if (d.export != null) o.exportExcel = d.export !== false && d.export !== "false";
        if (d.pagination != null) o.pagination = d.pagination !== false && d.pagination !== "false";
        if (d.exportName) o.exportFileName = d.exportName;
        // Reuse an EXISTING control instead of building one — value is a CSS
        // selector (e.g. "#retirement .tp-btn-export"). Lets a table declare,
        // right in the markup, which search box / export button to drive.
        if (d.searchInput) o.searchInput = d.searchInput;
        if (d.exportButton) o.exportButton = d.exportButton;
        return o;
    }

    // ==============================================================
    //  PUBLIC API
    // ==============================================================

    // Global helper — the "just pass an id" entry point.
    //   TableTools('#id')  |  TableTools('#id', { search:false })
    window.TableTools = function (selector, options) {
        $(selector).each(function () { initOne(this, options); });
        return this;
    };

    // jQuery-plugin form for those who prefer it: $('#id').tableTools({...})
    $.fn.tableTools = function (options) {
        return this.each(function () { initOne(this, options); });
    };

    // Auto-init: any <table data-table-tools> is enhanced on DOM-ready with
    // zero JavaScript, honouring its data-* switches. This is the most
    // "individual control" path — everything is declared in the markup.
    $(function () {
        $("table[data-table-tools]").each(function () { initOne(this); });
    });
})(jQuery);
