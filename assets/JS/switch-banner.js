// Function to switch between banner sections
        function switchBanner(targetBannerId) {
            const allBanners = document.querySelectorAll('.top-add');

            // Hide all banners with fade effect
            allBanners.forEach(banner => {
                banner.classList.add('banner-fade');
                setTimeout(() => {
                    banner.style.display = 'none';
                }, 300);
            });

            // Show target banner with fade effect
            setTimeout(() => {
                const targetBanner = document.getElementById(targetBannerId);
                if (targetBanner) {
                    targetBanner.style.display = 'block';
                    setTimeout(() => {
                        targetBanner.classList.remove('banner-fade');
                    }, 50);
                }
            }, 300);
        }

        function switchGraph(targetGraphId) {
            const allGraphs = document.querySelectorAll('.graph-slider');

            allGraphs.forEach(graph => {
                graph.style.display = 'none';
            });

            const targetGraph = document.getElementById(targetGraphId);
            if (targetGraph) {
                targetGraph.style.display = 'block';
                if (typeof window.graphSliderRefresh === 'function') {
                    window.graphSliderRefresh();
                }
            }
        }

        // Add event listeners to tab buttons
        document.addEventListener('DOMContentLoaded', function () {
            const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');

            tabButtons.forEach(button => {
                button.addEventListener('shown.bs.tab', function (e) {
                    const targetBannerId = e.target.getAttribute('data-banner');
                    const targetGraphId = e.target.getAttribute('data-graph');
                    if (targetBannerId) {
                        switchBanner(targetBannerId);
                    }
                    if (targetGraphId) {
                        switchGraph(targetGraphId);
                    }
                });
            });
        });
