$(document).ready(function () {

            module("Table markup creation");

            var data = {
                "table": {
                    "columns": [
                            {
                                "name": "firstName",
                                "displayName": "First Name"
                            },
                            {
                                "name": "lastName",
                                "displayName": "Last Name"
                            }
                        ]
                }
            }

            test("Generate table headers", function () {

                $('#qunit-fixture').tablePlugin(data);

                var table = $('#qunit-fixture');
                var thead = table.find("thead tr");

                equal(thead.find('th').size(),
                    data.table.columns.length,
                    "Expect number of generated table headers to match number in model");

                equal(thead.find('th').first().html(),
                    data.table.columns[0].displayName,
                    "Expect inner HTML to be display name");

                equal(thead.find('th').first().attr('data-name'),
                    data.table.columns[0].name,
                    "Expect data-name attribute to be set to name");

            });

        });