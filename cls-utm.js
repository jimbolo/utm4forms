  var _uf = _uf || {};
  _uf.domain = ".127.0.0.1"; // replace with your domain

 var UtmCookie;
UtmCookie = (function() {
  function UtmCookie(options) {
    if (options == null) {
      options = {};
    }
    this._cookieNamePrefix = '_uc_';
    this._domain = options.domain;
    this._sessionLength = options.sessionLength || 1;
    this._cookieExpiryDays = options.cookieExpiryDays || 365;
    this._additionalParams = options.additionalParams || [];
    // 'msclkid','gclid','zc_gad' added by Cem Avsar on 2021
    this._utmParams = ['msclkid','gclid','zc_gad','utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    this.writeInitialReferrer();
    this.writeLastReferrer();
    this.writeInitialLandingPageUrl();
    this.setCurrentSession();
    if (this.additionalParamsPresentInUrl()) {
      this.writeAdditionalParams();
    }
    if (this.utmPresentInUrl()) {
      this.writeUtmCookieFromParams();
    }
    return;
  }

  UtmCookie.prototype.createCookie = function(name, value, days, path, domain, secure) {
    var cookieDomain, cookieExpire, cookiePath, cookieSecure, date, expireDate;
    expireDate = null;
    if (days) {
      date = new Date;
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expireDate = date;
    }
    cookieExpire = expireDate != null ? '; expires=' + expireDate.toGMTString() : '';
    cookiePath = path != null ? '; path=' + path : '; path=/';
    cookieDomain = domain != null ? '; domain=' + domain : '';
    cookieSecure = secure != null ? '; secure' : '';
    document.cookie = this._cookieNamePrefix + name + '=' + escape(value) + cookieExpire + cookiePath + cookieDomain + cookieSecure;
  };

  UtmCookie.prototype.readCookie = function(name) {
    var c, ca, i, nameEQ;
    nameEQ = this._cookieNamePrefix + name + '=';
    ca = document.cookie.split(';');
    i = 0;
    while (i < ca.length) {
      c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
      i++;
    }
    return null;
  };

  UtmCookie.prototype.eraseCookie = function(name) {
    this.createCookie(name, '', -1, null, this._domain);
  };

  UtmCookie.prototype.getParameterByName = function(name) {
    var regex, regexS, results;
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    regexS = '[\\?&]' + name + '=([^&#]*)';
    regex = new RegExp(regexS);
    results = regex.exec(window.location.search);
    if (results) {
      return decodeURIComponent(results[1].replace(/\+/g, ' '));
    } else {
      return '';
    }
  };

  UtmCookie.prototype.additionalParamsPresentInUrl = function() {
    var j, len, param, ref;
    ref = this._additionalParams;
    for (j = 0, len = ref.length; j < len; j++) {
      param = ref[j];
      if (this.getParameterByName(param)) {
        return true;
      }
    }
    return false;
  };

  UtmCookie.prototype.utmPresentInUrl = function() {
    var j, len, param, ref;
    ref = this._utmParams;
    for (j = 0, len = ref.length; j < len; j++) {
      param = ref[j];
      if (this.getParameterByName(param)) {
        return true;
      }
    }
    return false;
  };

  UtmCookie.prototype.writeCookie = function(name, value) {
    this.createCookie(name, value, this._cookieExpiryDays, null, this._domain);
  };

  UtmCookie.prototype.writeAdditionalParams = function() {
    var j, len, param, ref, value;
    ref = this._additionalParams;
    for (j = 0, len = ref.length; j < len; j++) {
      param = ref[j];
      value = this.getParameterByName(param);
      this.writeCookie(param, value);
    }
  };

  UtmCookie.prototype.writeUtmCookieFromParams = function() {
    var j, len, param, ref, value;
    ref = this._utmParams;
    for (j = 0, len = ref.length; j < len; j++) {
      param = ref[j];
      value = this.getParameterByName(param);
      this.writeCookie(param, value);
    }
  };

  UtmCookie.prototype.writeCookieOnce = function(name, value) {
    var existingValue;
    existingValue = this.readCookie(name);
    if (!existingValue) {
      this.writeCookie(name, value);
    }
  };

  UtmCookie.prototype._sameDomainReferrer = function(referrer) {
    var hostname;
    hostname = document.location.hostname;
    return referrer.indexOf(this._domain) > -1 || referrer.indexOf(hostname) > -1;
  };

  UtmCookie.prototype._isInvalidReferrer = function(referrer) {
    return referrer === '' || referrer === void 0;
  };

  UtmCookie.prototype.writeInitialReferrer = function() {
    var value;
    value = document.referrer;
    if (this._isInvalidReferrer(value)) {
      value = 'direct';
    }
    this.writeCookieOnce('referrer', value);
  };

  UtmCookie.prototype.writeLastReferrer = function() {
    var value;
    value = document.referrer;
    if (!this._sameDomainReferrer(value)) {
      if (this._isInvalidReferrer(value)) {
        value = 'direct';
      }
      this.writeCookie('last_referrer', value);
    }
  };

  UtmCookie.prototype.writeInitialLandingPageUrl = function() {
    var value;
    value = this.cleanUrl();
    if (value) {
      this.writeCookieOnce('initial_landing_page', value);
    }
  };

  UtmCookie.prototype.initialReferrer = function() {
    return (this.readCookie('referrer'));
  };

  UtmCookie.prototype.lastReferrer = function() {
    return (this.readCookie('last_referrer'));
  };

  UtmCookie.prototype.initialLandingPageUrl = function() {
    return this.readCookie('initial_landing_page');
  };

  UtmCookie.prototype.incrementVisitCount = function() {
    var cookieName, existingValue, newValue;
    cookieName = 'visits';
    existingValue = parseInt(this.readCookie(cookieName), 10);
    newValue = 1;
    if (isNaN(existingValue)) {
      newValue = 1;
    } else {
      newValue = existingValue + 1;
    }
    this.writeCookie(cookieName, newValue);
  };

  UtmCookie.prototype.visits = function() {
    return this.readCookie('visits');
  };

  UtmCookie.prototype.setCurrentSession = function() {
    var cookieName, existingValue;
    cookieName = 'current_session';
    existingValue = this.readCookie(cookieName);
    if (!existingValue) {
      this.createCookie(cookieName, 'true', this._sessionLength / 24, null, this._domain);
      this.incrementVisitCount();
    }
  };

  UtmCookie.prototype.cleanUrl = function() {
    var cleanSearch;
    cleanSearch = window.location.search.replace(/utm_[^&]+&?/g, '').replace(/&$/, '').replace(/^\?$/, '');
    return window.location.origin + window.location.pathname + cleanSearch + window.location.hash;
  };

  return UtmCookie;

})();

var UtmForm, _uf;

UtmForm = (function() {
  function UtmForm(options) {
    if (options == null) {
      options = {};
    }
    this._utmParamsMap = {};
    this._utmParamsMap.gclid = options.vtm_gclid_field || "gclid"; // Addded by Cem Avsar on 2021
    this._utmParamsMap.msclkid = options.vtm_msclkid_field || "msclkid"; // Addded by Cem Avsar on 2021
    this._utmParamsMap.zc_gad = options.vtm_msclkid_field || "zc_gad"; // Addded by Cem Avsar on 2021
    this._utmParamsMap.utm_source = options.utm_source_field || "u_source";
    this._utmParamsMap.utm_medium = options.utm_medium_field || "u_medium";
    this._utmParamsMap.utm_campaign =
      options.utm_campaign_field || "u_campaign";
    this._utmParamsMap.utm_content = options.utm_content_field || "u_content";
    this._utmParamsMap.utm_term = options.utm_term_field || "u_term";

    this._additionalParamsMap = options.additional_params_map || {};
    this._initialReferrerField =
      options.initial_referrer_field || "u_firstreferrer";
    this._lastReferrerField = options.last_referrer_field || "u_lastreferrer";
    this._initialLandingPageField =
      options.initial_landing_page_field || "u_firstlandingpage";
    this._visitsField = options.visits_field || "u_visits";

    // Options:
    // "none": Don't add any fields to any form
    // "first": Add UTM and other fields to only first form on the page
    // "all": (Default) Add UTM and other fields to all forms on the page
    // following formIdArray Added by Cem Avsar on 09/26/23
    // "formIdArray": Attach UTMs values to only the forms with the ids specified in the array

    this._addToForm = options.add_to_form || "formIdArray"; // Modified by Cem Avsar on 09/26/23
    this._formQuerySelector = options.form_query_selector || "form";

    this.utmCookie = new UtmCookie({
      domain: options.domain,
      sessionLength: options.sessionLength,
      cookieExpiryDays: options.cookieExpiryDays,
      additionalParams: Object.getOwnPropertyNames(this._additionalParamsMap),
    });
    this.addAllFields();
  }

  UtmForm.prototype.addAllFields = function() {
    var allForms, i, len;
    allForms = document.querySelectorAll(this._formQuerySelector);

    // "none": Don't add any fields to any form
    if (this._addToForm === 'none') {
      len = 0;

    // "first": Add UTM and other fields to only first form on the page
    } else if (this._addToForm === 'first') {
      len = Math.min(1, allForms.length);
    } 
    // Following Added by Cem Avsar on 09/26/23
    // "all": (Default) Add UTM and other fields to all forms on the page
    else if (this._addToForm === 'all') {
      len = allForms.length;
    }
    // Following Added by Cem Avsar on 09/26/23 
    // loop through the formIdArray and check if the form id or class is in the array
    // `formIdArray` Attach UTMs values to only the forms with the ids specified in the array
    else if (this._addToForm === "formIdArray") {
      var formIdArray = ["form1", "form2", "wpcf7-form"]; // replace with your form ids
      for (var j = 0; j < allForms.length; j++) {
        // match form id or class partially
        if (formIdArray.some((item) => allForms[j].id.match(item)) || formIdArray.some((item) => allForms[j].className.match(item))) {
          this.addAllFieldsToForm(allForms[j]);
          console.log("form id: " + allForms[j].id + " utm values attached");
          console.log("form class: " + allForms[j].className + " utm values attached");
        }
      }
    }

  

    else {
      // Following Modified by Cem Avsar on 09/26/23
      // len = allForms.length; // removed this line
      // added following line len = 0
      len = 0;
    }
    i = 0;
    while (i < len) {
      this.addAllFieldsToForm(allForms[i]);
      i++;
    }
  };

  UtmForm.prototype.addAllFieldsToForm = function(form) {
    var fieldName, param, ref, ref1;
    if (form && !form._utm_tagged) {
      form._utm_tagged = true;
      ref = this._utmParamsMap;
      for (param in ref) {
        fieldName = ref[param];
        this.addFormElem(form, fieldName, this.utmCookie.readCookie(param));
      }
      ref1 = this._additionalParamsMap;
      for (param in ref1) {
        fieldName = ref1[param];
        this.addFormElem(form, fieldName, this.utmCookie.readCookie(param));
      }
      this.addFormElem(form, this._initialReferrerField, this.utmCookie.initialReferrer());
      this.addFormElem(form, this._lastReferrerField, this.utmCookie.lastReferrer());
      this.addFormElem(form, this._initialLandingPageField, this.utmCookie.initialLandingPageUrl());
      this.addFormElem(form, this._visitsField, this.utmCookie.visits());
    }
  };

  UtmForm.prototype.addFormElem = function(form, fieldName, fieldValue) {
    this.insertAfter(this.getFieldEl(fieldName, fieldValue), form.lastChild);
  };

   UtmForm.prototype.getFieldEl = function(fieldName, fieldValue) {
     // check if the form already has a hidden input field with the same name as the field name we are trying to add
     // if it does, then we update the value of the field
     var inputExist = document.querySelector('input[name="' + fieldName + '"]');
     if (inputExist) {
       // if the input exists
       inputExist.value = fieldValue; // update the value of the input
     }

     // Following Added by Cem Avsar on 2022
     // check if the form already has a hidden input field named zc_gad (zoho crm)
     // if it does, then we update the value of the field to the gclid cookie value
     var zc_gad = document.querySelector('input[name="zc_gad"]');
     if (zc_gad) {
       // if the input exists
       // set zc_gad.value to gclid cookie value
       zc_gad.value = this.utmCookie.readCookie("gclid"); // update the value of the input
     }
     // if it doesn't, then we add the field to the form
     inputExist = document.createElement("input");
     inputExist.type = "hidden";
     inputExist.name = fieldName;
     inputExist.value = fieldValue;
     // Following Added by Cem Avsar on 09/26/23
     // now decode hidden input values for all hidden inputs
     var hiddenInputs = document.querySelectorAll('input[type="hidden"]');
     for (var i = 0; i < hiddenInputs.length; i++) {
       try {
         hiddenInputs[i].value = decodeURIComponent(hiddenInputs[i].value);
       } catch (e) {
         // if we can't decode, then
         inputExist.value = fieldValue;
       }
     }

     return inputExist;
   };

  UtmForm.prototype.insertAfter = function(newNode, referenceNode) {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  };

  return UtmForm;

})();

_uf = window._uf || {};

window.UtmForm = new UtmForm(_uf);
