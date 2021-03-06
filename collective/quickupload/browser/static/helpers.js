/**
 *
 * JQuery Helpers for Plone Quick Upload
 *
 */

var PloneQuickUpload = {};

PloneQuickUpload.addUploadFields = function(uploader, domelement, file, id, fillTitles, fillDescriptions) {
    var blocFile;
    if (fillTitles || fillDescriptions)  {
        blocFile = uploader._getItemByFileId(id);
        if (typeof id == 'string') id = parseInt(id.replace('qq-upload-handler-iframe',''));
    }
    if (fillDescriptions)  {
        var labelfiledescription = jQuery('#uploadify_label_file_description').val();
        jQuery('.qq-upload-cancel', blocFile).after('\
                  <div class="uploadField">\
                      <label>' + labelfiledescription + '&nbsp;:&nbsp;</label> \
                      <textarea rows="2" \
                             class="file_description_field" \
                             id="description_' + id + '" \
                             name="description" \
                             value="" />\
                  </div>\
                   ')
    }
    if (fillTitles)  {
        var labelfiletitle = jQuery('#uploadify_label_file_title').val();
        jQuery('.qq-upload-cancel', blocFile).after('\
                  <div class="uploadField">\
                      <label>' + labelfiletitle + '&nbsp;:&nbsp;</label> \
                      <input type="text" \
                             class="file_title_field" \
                             id="title_' + id + '" \
                             name="title" \
                             value="" />\
                  </div>\
                   ')
    }
    PloneQuickUpload.showButtons(uploader, domelement);
};

PloneQuickUpload.showButtons = function(uploader, domelement) {
    var handler = uploader._handler;
    if (handler._files.length) {
        jQuery('.uploadifybuttons', jQuery(domelement).parent()).show();
        return 'ok';
    }
    return false;
};

PloneQuickUpload.sendDataAndUpload = function(uploader, domelement, typeupload) {
    var handler = uploader._handler;
    var files = handler._files;
    var missing = 0;
    for ( var id = 0; id < files.length; id++ ) {
        if (files[id]) {
            var fileContainer = jQuery('.qq-upload-list li', domelement)[id-missing];
            var file_title = '';
            if (fillTitles)  {
                file_title = jQuery('.file_title_field', fileContainer).val();
            }
            var file_description = '';
            if (fillDescriptions)  {
                file_description = jQuery('.file_description_field', fileContainer).val();
            }
            uploader._queueUpload(id, {'title': file_title, 'description': file_description, 'typeupload' : typeupload});
        }
        // if file is null for any reason jq block is no more here
        else missing++;
    }
};

PloneQuickUpload.onAllUploadsComplete = function(){
    jQuery(document).trigger('qq-allfiles-uploaded');
    Browser.onUploadComplete();
};

PloneQuickUpload.clearQueue = function(uploader, domelement) {
    var handler = uploader._handler;
    var files = handler._files;
    for ( var id = 0; id < files.length; id++ ) {
        if (files[id]) {
            handler.cancel(id);
        }
        jQuery('.qq-upload-list li', domelement).remove();
        handler._files = [];
        if (typeof handler._inputs != 'undefined') handler._inputs = {};
    }
    jQuery('.uploadifybuttons').hide();
};

PloneQuickUpload.onUploadComplete = function(uploader, domelement, id, fileName, responseJSON) {
    var uploadList = jQuery('.qq-upload-list', domelement);
    if (responseJSON.success) {
        window.setTimeout( function() {
            jQuery(uploader._getItemByFileId(id)).remove();
            // after the last upload, if no errors, reload the page
            var newlist = jQuery('li', uploadList);
            jQuery(document).trigger('qq-file-uploaded', responseJSON);
            if (! newlist.length) window.setTimeout( PloneQuickUpload.onAllUploadsComplete, 5);
        }, 50);
    }
};

/* Open the collective.quickupload ajax view when #contentview-upload (an action) is clicked.
   The hidden input field is wrapped in a form in a viewlet: form#quickuploader-viewlet
*/

PloneQuickUpload.showUploaderViewlet = function () {
    // If it gets called again when it's already opened it loads the
    // content of the page into the element
    if ( jQuery(".quick-uploader").length < 1 ) {
        jQuery("form#quickuploader-viewlet").show();
        jQuery(this).addClass("selected");
        jQuery("form#quickuploader-viewlet").each(function(){
            var uploadUrl =  jQuery('.uploadUrl', this).val();
            var uploadData =  jQuery('.uploadData', this).val();
            var UlDiv = jQuery(this);
            jQuery.ajax({
                type: 'GET',
                url: uploadUrl,
                data: uploadData,
                dataType: 'html',
                contentType: 'text/html; charset=utf-8',
                success: function(html) {
                    UlDiv.html(html);
                } });
        });
    };
};

// workaround this MSIE bug :
// https://dev.plone.org/plone/ticket/10894
if (jQuery.browser.msie)
    jQuery("#settings").remove();
var Browser = {};
Browser.onUploadComplete = function() {
    window.location.reload();
}

jQuery(document).ready( function () {
    // Disable the action link
    uploadAction = jQuery("#contentview-upload")
        .find("a")
        .removeAttr("href");

    jQuery("#contentview-upload").click(PloneQuickUpload.showUploaderViewlet);
})
