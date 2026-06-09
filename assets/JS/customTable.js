// ── Sort ──────────────────────────────────────────────────────
let sortDirections = {};

function parseDate(value) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.getTime();
    const parts = value.split(/[-\/]/);
    if (parts.length === 3) {
        let [d, m, y] = parts.map(Number);
        if (y < 100) y += 2000;
        return new Date(y, m - 1, d).getTime();
    }
    return null;
}

function sortTable(tableId, colIndex) {
    const table = document.getElementById(tableId);
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const key = tableId + "_" + colIndex;

    if (!sortDirections[key]) sortDirections[key] = "asc";
    else sortDirections[key] = sortDirections[key] === "asc" ? "desc" : "asc";

    const direction = sortDirections[key];

    rows.sort((rowA, rowB) => {
        let x = rowA.children[colIndex].innerText.trim();
        let y = rowB.children[colIndex].innerText.trim();

        const xDate = parseDate(x);
        const yDate = parseDate(y);
        if (xDate !== null && yDate !== null)
            return direction === "asc" ? xDate - yDate : yDate - xDate;

        const xNum = parseFloat(x);
        const yNum = parseFloat(y);
        if (!isNaN(xNum) && !isNaN(yNum))
            return direction === "asc" ? xNum - yNum : yNum - xNum;

        return direction === "asc" ? x.localeCompare(y) : y.localeCompare(x);
    });

    const tbody = table.querySelector("tbody");
    rows.forEach(row => tbody.appendChild(row));
}

// ── Pagination ────────────────────────────────────────────────
function getPagination(tableSelector) {
    const $table = $(tableSelector);
    const tableId = $table.attr('id') || 'table_' + Math.random().toString(36).substr(2, 9);
    if (!$table.attr('id')) $table.attr('id', tableId);

    const maxRowsSelector = '#maxRows_' + tableId;
    const paginationSelector = '.pagination_' + tableId;

    let $pagination = $(paginationSelector);
    if ($pagination.length === 0) {
        $table.closest('.table-section').append(`
            <div class="pagination-container">
                <div class="rows-selector">
                    <label>Rows per page:
                        <select id="maxRows_${tableId}" class="form-control">
                            <option value="5">5</option>
                            <option value="10" selected>10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="5000">Show All</option>
                        </select>
                    </label>
                </div>
                <ul class="pagination pagination_${tableId}">
                    <li class="page-item page-prev" data-page="prev">
                        <a class="page-link" href="#"><i class="fa-solid fa-chevron-left"></i> Prev</a>
                    </li>
                    <li class="page-item page-next" data-page="next">
                        <a class="page-link" href="#">Next <i class="fa-solid fa-chevron-right"></i></a>
                    </li>
                </ul>
            </div>
        `);
        $pagination = $(paginationSelector);
    }

    let lastPage = 1;

    $(maxRowsSelector).on('change', function () {
        lastPage = 1;
        $pagination.find('li').slice(1, -1).remove();

        let trnum = 0;
        const maxRows = parseInt($(this).val());
        const totalRows = $('#' + tableId + ' tbody tr').length;

        if (maxRows == 5000) $pagination.hide();
        else $pagination.show();

        $('#' + tableId + ' tbody tr').each(function () {
            trnum++;
            $(this).toggle(trnum <= maxRows);
        });

        const totalPages = Math.ceil(totalRows / maxRows);

        for (let i = 1; i <= totalPages; i++) {
            $pagination.find('.page-next').before(`
                <li class="page-item page-number" data-page="${i}">
                    <a class="page-link" href="#">${i}</a>
                </li>
            `);
        }

        $pagination.find('[data-page="1"]').addClass('active');

        $pagination.find('li').off('click').on('click', function (evt) {
            evt.preventDefault();
            let pageNum = $(this).attr('data-page');

            if (pageNum === "prev" && lastPage > 1) lastPage--;
            else if (pageNum === "next" && lastPage < totalPages) lastPage++;
            else if (!isNaN(parseInt(pageNum))) lastPage = parseInt(pageNum);
            else return;

            $pagination.find('li').removeClass('active');
            $pagination.find('[data-page="' + lastPage + '"]').addClass('active');
            limitPagging($pagination, lastPage, totalPages);

            let trIndex = 0;
            $('#' + tableId + ' tbody tr').each(function () {
                trIndex++;
                const start = maxRows * (lastPage - 1) + 1;
                const end = maxRows * lastPage;
                $(this).toggle(trIndex >= start && trIndex <= end);
            });
        });

        limitPagging($pagination, lastPage, totalPages);
    }).val(10).change();

    function limitPagging($pag, currentPage, totalPages) {
        $pag.find('.page-number').hide();
        $pag.find('.ellipsis').remove();

        const windowSize = 2;

        $pag.find('[data-page="1"]').show();
        $pag.find('[data-page="' + totalPages + '"]').show();

        for (let i = currentPage - windowSize; i <= currentPage + windowSize; i++) {
            if (i > 1 && i < totalPages)
                $pag.find('[data-page="' + i + '"]').show();
        }

        if (currentPage - windowSize > 2) {
            $pag.find('[data-page="1"]').after(`
                <li class="page-item disabled ellipsis"><a class="page-link">...</a></li>
            `);
        }

        if (currentPage + windowSize < totalPages - 1) {
            $pag.find('[data-page="' + totalPages + '"]').before(`
                <li class="page-item disabled ellipsis"><a class="page-link">...</a></li>
            `);
        }
    }
}

// ── Init — add your table IDs here ────────────────────────────
$(document).ready(function () {
    getPagination('#table1');
    // getPagination('#table2');  // add more as needed
});