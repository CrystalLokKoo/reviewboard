/*
 * Creates a form dialog based on serialized form field data.
 * This will handle creating and managing a form dialog and posting the
 * resulting data to the server.
 *
 * options has the following fields:
 *
 *    action          - The action. Defaults to "."
 *    confirmLabel    - The label on the confirm button.
 *    fields          - The serialized field data.
 *    dataStoreObject - The object to edit or create.
 *    success         - The success function. By default, this reloads the page.
 *    title           - The form title.
 *    upload          - true if this is an upload form.
 *    width           - The optional set width of the form.
 *
 * options.fields is a dictionary with the following fields:
 *
 *    name      - The name of the field.
 *    hidden    - true if this is a hidden field.
 *    label     - The label tag for the field.
 *    required  - true if this field is required.
 *    help_text - Optional help text.
 *    widget    - The HTML for the field.
 *
 * @param {object} options  The options for the dialog.
 *
 * @return {jQuery} The form dialog.
 */
$.fn.formDlg = function(options) {
    options = $.extend({
        action: ".",
        confirmLabel: "Send",
        fields: {},
        dataStoreObject: null,
        success: function() { window.location.reload(); },
        title: "",
        upload: false,
        width: null
    }, options);

    return this.each(function() {
        var self = $(this);

        var errors = $("<div/>")
            .addClass("error")
            .hide();

        var form = $("<form/>")
            .attr("action", options.action)
            .submit(function(e) {
                send();
                return false;
            })
            .append($("<table/>")
                .append($("<colgroup/>")
                    .append('<col/>')
                    .append('<col/>')
                    .append('<col width="100%"/>'))
                .append($("<tbody/>")));

        if (options.upload) {
            form.attr({
                encoding: "multipart/form-data",
                enctype:  "multipart/form-data"
            });
        }

        var tbody = $("tbody", form);

        var fieldInfo = {};

        for (var i = 0; i < options.fields.length; i++) {
            var field = options.fields[i];
            fieldInfo[field.name] = {'field': field};

            if (field.hidden) {
                form.append($(field.widget));
            } else {
                fieldInfo[field.name].row =
                    $("<tr/>")
                        .appendTo(tbody)
                        .append($("<td/>")
                            .addClass("label")
                            .html(field.label))
                        .append($("<td/>")
                            .html(field.widget))
                        .append($("<td/>")
                            .append($("<ul/>")
                                .addClass("errorlist")
                                .hide()));

                if (field.required) {
                    $("label", fieldInfo[field.name].row)
                        .addClass("required");
                }

                if (field.help_text) {
                    $("<tr/>")
                        .appendTo(tbody)
                        .append("<td/>")
                        .append($("<td/>")
                            .addClass("help")
                            .attr("colspan", 2)
                            .text(field.help_text));
                }
            }
        }

        var box = $("<div/>")
            .addClass("formdlg")
            .append(errors)
            .append(self)
            .append(form)
            .keypress(function(e) {
                e.stopPropagation();
            });

        if (options.width) {
            box.width(options.width);
        }

        box.modalBox({
            title: options.title,
            buttons: [
                $('<input type="button"/>')
                    .val("Cancel"),
                $('<input type="button"/>')
                    .val(options.confirmLabel)
                    .click(function() {
                        form.submit();
                        return false;
                    })
            ]
        });

        /*
         * Sends the form data to the server.
         */
        function send() {
            options.dataStoreObject.setForm(form);
            options.dataStoreObject.save({
                buttons: $("input:button", box.modalBox("buttons")),
                success: function(rsp) {
                    options.success(rsp);
                    box.remove();
                },
                error: function(rsp) { // error
                    displayErrors(rsp);
                }
            });
        }


        /*
         * Displays errors on the form.
         *
         * @param {object} rsp  The server response.
         */
        function displayErrors(rsp) {
            var errorStr = rsp.err.msg;

            if (options.dataStoreObject.getErrorString) {
                errorStr = options.dataStoreObject.getErrorString(rsp);
            }

            errors
                .html(errorStr)
                .show();

            if (rsp.fields) {
                /* Invalid form data */
                for (var fieldName in rsp.fields) {
                    if (!fieldInfo[fieldName]) {
                        continue;
                    }

                    var list = $(".errorlist", fieldInfo[fieldName].row)
                        .css("display", "block");

                    for (var i = 0; i < rsp.fields[fieldName].length; i++) {
                        $("<li/>")
                            .appendTo(list)
                            .html(rsp.fields[fieldName][i]);
                    }
                }
            }
        }
    });
};


/*
 * Toggles whether an object is starred. Right now, we support
 * "reviewrequests" and "groups" types.
 *
 * @param {string} type      The type used for constructing the path.
 * @param {string} objid     The object ID to star/unstar.
 * @param {bool}   default_  The default value.
 */
$.fn.toggleStar = function(type, objid, default_) {
    return this.each(function() {
        var self = $(this);

        // Constants
        var STAR_ON_IMG = MEDIA_URL + "rb/images/star_on.png?" + MEDIA_SERIAL;
        var STAR_OFF_IMG = MEDIA_URL + "rb/images/star_off.png?" + MEDIA_SERIAL;

        var obj;
        var on = default_;

        self.click(function() {
            on = !on;

            if (!obj) {
                if (type == "reviewrequests") {
                    obj = new RB.ReviewRequest(objid);
                } else if (type == "groups") {
                    obj = new RB.ReviewGroup(objid);
                } else {
                    self.remove();
                    return;
                }
            }

            obj.setStarred(on);
            self.attr("src", (on ? STAR_ON_IMG : STAR_OFF_IMG));

            var alt_title = on ? "Starred" : "Click to star";
            self.attr("alt", alt_title);
            self.attr("title", alt_title);
        });
    });
};

$.fn.searchAutoComplete = function() {
        $("#search_field")
            .autocomplete({
                formatItem: function(data) {
                    var s;
                    if (data["username"])
                    {
                        //s = "<a href =\"" + data["url"] + "\">" + data["username"] + "</a>";
                        //s += " <span>(" + data["fullname"] + ")</span>";
                        s = data["url"];
                    }
                    if (data["name"])
                    {
                        s = data["name"];
                        s += " <span>(" + data["display_name"] + ")</span>";
                    }

                    if (data["summary"])
                    {
                        s = data["summary"];
                        s += " <span>(" + data["id"] + ")</span>";
                    }

                    return s;
                },
                matchCase: false,
                multiple: true,
                parse: function(data) {
                    var jsonData = eval("(" + data + ")");
                    var jsonDataSearch = jsonData["search"];
                    var parsed = [];

                    var objects = new Array();
                    objects[0] = "users";
                    objects[1] = "groups";
                    objects[2] = "review_requests";

                    var values = new Array();
                    values[0] = "username";
                    values[1] = "name";
                    values[2] = "summary";

                    var items;

                    for (var j = 0; j < objects.length; j++){
                        items = jsonDataSearch[(objects[j])];

                        for (var i = 0; i < items.length; i++) {
                            var value = items[i];

                            parsed.push({
                                data: value,
                                value: value[values[j]],
                                result: value[values[j]]
                            });
                        }
                    }

                    return parsed;
                },
                url: SITE_ROOT + "api/" + "search" + "/",
                highlight: function(formatted, term) {
                    var s = "<div>" + "</div>";
                    return $(s)
                        .html($.ui.autocomplete.defaults.highlight(formatted, term))
                        .click(function() {
                            alert('hi');
                            window.open(formatted, self);
                            return false;
                        });
                },

        })
         .bind("autocompleteshow", function() {
                /*
                 * Add the footer to the bottom of the results pane the
                 * first time it's created.
                 */
                var resultsPane = $(".ui-autocomplete-results");

                if ($(".ui-autocomplete-footer", resultsPane).length == 0) {
                    $("<div/>")
                        .addClass("ui-autocomplete-footer")
                        .text("Press Tab to auto-complete.")
                        .appendTo(resultsPane);
                }
        });
       
};


$(document).ready(function() {
    $('<div id="activity-indicator" />')
        .text("Loading...")
        .hide()
        .appendTo("body");

    var searchGroupsEl = $("#search_field");

    if (searchGroupsEl.length > 0) {
        searchGroupsEl
            .searchAutoComplete();
    }

});

// vim: set et:sw=4:
