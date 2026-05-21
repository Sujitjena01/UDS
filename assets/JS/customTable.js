 /* ==================================== */
 // Function to sort table columns
 /* ==================================== */
let sortDirections = {};

function parseDate(value) {
    // Try to parse date formats
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.getTime();

    // For dd-mm-yyyy or dd/mm/yyyy
    const parts = value.split(/[-\/]/);
    if (parts.length === 3) {
        let [d, m, y] = parts.map(Number);
        if (y < 100) y += 2000; // optional fix for yy formats
        return new Date(y, m - 1, d).getTime();
    }
    return null;
}

function sortTable(tableId, colIndex) {
    const table = document.getElementById(tableId);
    const rows = Array.from(table.querySelectorAll("tbody tr"));

    const key = tableId + "_" + colIndex;

    // Default: first click = ascending
    if (!sortDirections[key]) sortDirections[key] = "asc";
    else sortDirections[key] = sortDirections[key] === "asc" ? "desc" : "asc";

    const direction = sortDirections[key];

    rows.sort((rowA, rowB) => {
        let x = rowA.children[colIndex].innerText.trim();
        let y = rowB.children[colIndex].innerText.trim();

        // Date detect
        const xDate = parseDate(x);
        const yDate = parseDate(y);

        if (xDate !== null && yDate !== null) {
            return direction === "asc" ? xDate - yDate : yDate - xDate;
        }

        // Number detect
        const xNum = parseFloat(x);
        const yNum = parseFloat(y);

        const isNumeric = !isNaN(xNum) && !isNaN(yNum);

        if (isNumeric) {
            return direction === "asc" ? xNum - yNum : yNum - xNum;
        }

        // Text
        return direction === "asc"
            ? x.localeCompare(y)
            : y.localeCompare(x);
    });

    const tbody = table.querySelector("tbody");
    rows.forEach(row => tbody.appendChild(row));
}


/* ==================================== */
 // MULTI-TABLE PAGINATION (UPDATED WITH ELLIPSIS)
/* ==================================== */

function getPagination(tableSelector) {
    const $table = $(tableSelector);
    const tableId = $table.attr('id') || 'table_' + Math.random().toString(36).substr(2, 9);

    if (!$table.attr('id')) {
        $table.attr('id', tableId);
    }

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

        // Display rows
        $('#' + tableId + ' tbody tr').each(function () {
            trnum++;
            $(this).toggle(trnum <= maxRows);
        });

        const totalPages = Math.ceil(totalRows / maxRows);

        // Create page numbers
        for (let i = 1; i <= totalPages; i++) {
            $pagination.find('.page-next').before(`
                <li class="page-item page-number" data-page="${i}">
                    <a class="page-link" href="#">${i}</a>
                </li>
            `);
        }

        $pagination.find('[data-page="1"]').addClass('active');

        // Page click handler
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


    // ===============================
    // RESPONSIVE PAGINATION WITH ...
    // ===============================
    function limitPagging($pag, currentPage, totalPages) {
        $pag.find('.page-number').hide();
        $pag.find('.ellipsis').remove();

        const windowSize = 2;

        // Always show first & last pages
        $pag.find('[data-page="1"]').show();
        $pag.find('[data-page="' + totalPages + '"]').show();

        // Show the pages around the current page
        for (let i = currentPage - windowSize; i <= currentPage + windowSize; i++) {
            if (i > 1 && i < totalPages) {
                $pag.find('[data-page="' + i + '"]').show();
            }
        }

        // Add ellipsis after first page
        if (currentPage - windowSize > 2) {
            $pag.find('[data-page="1"]').after(`
                <li class="page-item disabled ellipsis"><a class="page-link">...</a></li>
            `);
        }

        // Add ellipsis before last page
        if (currentPage + windowSize < totalPages - 1) {
            $pag.find('[data-page="' + totalPages + '"]').before(`
                <li class="page-item disabled ellipsis"><a class="page-link">...</a></li>
            `);
        }
    }
}

// Initialize pagination for multiple tables
$(document).ready(function () {
    getPagination('#table1');
    getPagination('#table2');
    getPagination('#table3');
    getPagination('#table4');
    getPagination('#faqtable');
});
     
// /* ==================================== */
// // PAGINATION
// /* ==================================== */

//         getPagination('#table2');
//         // getPagination('.table-class');
//         // getPagination('table');

//         /*					PAGINATION 
//         - on change max rows select options fade out all rows gt option value mx = 5
//         - append pagination list as per numbers of rows / max rows option (20row/5= 4pages )
//         - each pagination li on click -> fade out all tr gt max rows * li num and (5*pagenum 2 = 10 rows)
//         - fade out all tr lt max rows * li num - max rows ((5*pagenum 2 = 10) - 5)
//         - fade in all tr between (maxRows*PageNum) and (maxRows*pageNum)- MaxRows 
//         */


//         function getPagination(table) {
//             var lastPage = 1;

//             $('#maxRows')
//                 .on('change', function (evt) {
//                     //$('.paginationprev').html('');						// reset pagination

//                     lastPage = 1;
//                     $('.pagination')
//                         .find('li')
//                         .slice(1, -1)
//                         .remove();
//                     var trnum = 0; // reset tr counter
//                     var maxRows = parseInt($(this).val()); // get Max Rows from select option

//                     if (maxRows == 5000) {
//                         $('.pagination').hide();
//                     } else {
//                         $('.pagination').show();
//                     }

//                     var totalRows = $(table + ' tbody tr').length; // numbers of rows
//                     $(table + ' tr:gt(0)').each(function () {
//                         // each TR in  table and not the header
//                         trnum++; // Start Counter
//                         if (trnum > maxRows) {
//                             // if tr number gt maxRows

//                             $(this).hide(); // fade it out
//                         }
//                         if (trnum <= maxRows) {
//                             $(this).show();
//                         } // else fade in Important in case if it ..
//                     }); //  was fade out to fade it in
//                     if (totalRows > maxRows) {
//                         // if tr total rows gt max rows option
//                         var pagenum = Math.ceil(totalRows / maxRows); // ceil total(rows/maxrows) to get ..
//                         //	numbers of pages
//                         for (var i = 1; i <= pagenum;) {
//                             // for each page append pagination li
//                             $('.pagination #prev')
//                                 .before(
//                                     '<li class="page-item" data-page="' +
//                                     i +
//                                     '">\
// 								  <a class="page-link" href="#">' +
//                                     i++ +
//                                     '<span class="sr-only">(current)</span></a>\
// 								</li>'
//                                 )
//                                 .show();
//                         } // end for i
//                     } // end if row count > max rows
//                     $('.pagination [data-page="1"]').addClass('active'); // add active class to the first li
//                     $('.pagination li').on('click', function (evt) {
//                         // on click each page
//                         evt.stopImmediatePropagation();
//                         evt.preventDefault();
//                         var pageNum = $(this).attr('data-page'); // get it's number

//                         var maxRows = parseInt($('#maxRows').val()); // get Max Rows from select option

//                         if (pageNum == 'prev') {
//                             if (lastPage == 1) {
//                                 return;
//                             }
//                             pageNum = --lastPage;
//                         }
//                         if (pageNum == 'next') {
//                             if (lastPage == $('.pagination li').length - 2) {
//                                 return;
//                             }
//                             pageNum = ++lastPage;
//                         }

//                         lastPage = pageNum;
//                         var trIndex = 0; // reset tr counter
//                         $('.pagination li').removeClass('active'); // remove active class from all li
//                         $('.pagination [data-page="' + lastPage + '"]').addClass('active'); // add active class to the clicked
//                         // $(this).addClass('active');					// add active class to the clicked
//                         limitPagging();
//                         $(table + ' tr:gt(0)').each(function () {
//                             // each tr in table not the header
//                             trIndex++; // tr index counter
//                             // if tr index gt maxRows*pageNum or lt maxRows*pageNum-maxRows fade if out
//                             if (
//                                 trIndex > maxRows * pageNum ||
//                                 trIndex <= maxRows * pageNum - maxRows
//                             ) {
//                                 $(this).hide();
//                             } else {
//                                 $(this).show();
//                             } //else fade in
//                         }); // end of for each tr in table
//                     }); // end of on click pagination list
//                     limitPagging();
//                 })
//                 .val(10)
//                 .change();

//             // end of on select change

//             // END OF PAGINATION
//         }

//         function limitPagging() {
//             // alert($('.pagination li').length)

//             if ($('.pagination li').length > 7) {
//                 if ($('.pagination li.active').attr('data-page') <= 3) {
//                     $('.pagination li:gt(5)').hide();
//                     $('.pagination li:lt(5)').show();
//                     $('.pagination [data-page="next"]').show();
//                 } if ($('.pagination li.active').attr('data-page') > 3) {
//                     $('.pagination li:gt(0)').hide();
//                     $('.pagination [data-page="next"]').show();
//                     for (let i = (parseInt($('.pagination li.active').attr('data-page')) - 2); i <= (parseInt($('.pagination li.active').attr('data-page')) + 2); i++) {
//                         $('.pagination [data-page="' + i + '"]').show();

//                     }

//                 }
//             }
//         }

//         // $(function() {
//         //   // Just to append id number for each row
//         //   $('table tr:eq(0)').prepend('<th> ID </th>');

//         //   var id = 0;

//         //   $('table tr:gt(0)').each(function() {
//         //     id++;
//         //     $(this).prepend('<td>' + id + '</td>');
//         //   });
//         // });


        


/* ==================================== */
// Excel export function
/* ==================================== */
const tableIds = ['#table1', '#table2', '#table3', '#table4','#order-table'];

$('.export-btn').on('click', function () {

    let tableId = $(this).data('table');

    if (tableIds.includes(tableId)) {

        var table2excel = new Table2Excel();

        table2excel.export(
            document.querySelectorAll(tableId)
        );
    }
});




/* ==================================== */
// Search filter function (Table ID based)
/* ==================================== */
(function () {
    'use strict';

    function onInputEvent(e) {
        const input = e.target;
        const tableId = input.getAttribute('data-table'); 
        const table = document.getElementById(tableId);

        if (!table) return;

        const val = input.value.toLowerCase();

        // Show or hide clear (×) icon
        const clearBtn = input.parentElement.querySelector(".clear-btn");
        clearBtn.style.display = val ? "block" : "none";

        Array.from(table.tBodies).forEach(tbody => {
            Array.from(tbody.rows).forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.indexOf(val) === -1 ? "none" : "table-row";
            });
        });
    }

    function clearSearch(e) {
        const btn = e.target;
        const input = btn.parentElement.querySelector(".table-filter");
        input.value = "";
        btn.style.display = "none";
        input.dispatchEvent(new Event("input"));
        input.focus();
    }

    // Initialize filter inputs
    document.addEventListener("DOMContentLoaded", () => {
        const inputs = document.getElementsByClassName("table-filter");

        Array.from(inputs).forEach(input => {
            input.oninput = onInputEvent;

            // Add clear button event
            const btn = input.parentElement.querySelector(".clear-btn");
            if (btn) btn.onclick = clearSearch;
        });
    });
})();

const tableIds = ['#table2', '#table3'];

$(document).ready(function () {

    $('.sortable-table th').on('click', function () {

        const table = $(this).closest('table');
        const tbody = table.find('tbody');
        const columnIndex = $(this).index();
        const rows = tbody.find('tr').toArray();

        // determine new direction FIRST
        let isAsc = !$(this).hasClass('asc');

        // reset all headers
        table.find('th').removeClass('asc desc');

        // apply new class
        $(this).addClass(isAsc ? 'asc' : 'desc');

        rows.sort(function (a, b) {
            let A = $(a).children('td').eq(columnIndex).text().trim().toLowerCase();
            let B = $(b).children('td').eq(columnIndex).text().trim().toLowerCase();

            if (!isNaN(A) && !isNaN(B)) {
                return isAsc ? A - B : B - A;
            }

            return isAsc ? A.localeCompare(B) : B.localeCompare(A);
        });

        $.each(rows, function (_, row) {
            tbody.append(row);
        });

    });

});
