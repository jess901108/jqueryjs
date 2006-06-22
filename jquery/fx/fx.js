// overwrite the old show method
$.fn._show = $.fn.show;

/**
 * The effects module overloads the show method to now allow 
 * for a speed to the show operation. What actually happens is 
 * that the height, width, and opacity to the matched elements 
 * are changed dynamically. The only three current speeds are 
 * "slow", "normal", and "fast". For example:
 *   $("p").show("slow");
 * Note: You should not run the show method on things 
 * that are already shown. This can be circumvented by doing this:
 *   $("p:hidden").show("slow");
 */
$.fn.show = function(speed,callback){
	return speed ? this.animate({
		height: "show", width: "show", opacity: "show"
	}, speed, callback) : this._show();
};

// We're overwriting the old hide method
$.fn._hide = $.fn.hide;


/**
 * The hide function behaves very similary to the show function, 
 * but is just the opposite.
 *   $("p:visible").hide("slow");
 */
$.fn.hide = function(speed,callback){
	return speed ? this.animate({
		height: "hide",
		width: "hide",
		opacity: "hide"
	}, speed, callback) : this._hide();
};

/**
 * This function increases the height and opacity for all matched 
 * elements. This is very similar to 'show', but does not change 
 * the width - creating a neat sliding effect.
 *   $("p:hidden").slideDown("slow");
 */
$.fn.slideDown = function(speed,callback){
	return this.animate({height: "show"}, speed, callback);
};

/**
 * Just like slideDown, only it hides all matched elements.
 *   $("p:visible").slideUp("slow");
 */
$.fn.slideUp = function(speed,callback){
	return this.animate({height: "hide"}, speed, callback);
};

/**
 * Adjusts the opacity of all matched elements from a hidden, 
 * to a fully visible, state.
 *   $("p:hidden").fadeIn("slow");
 */
$.fn.fadeIn = function(speed,callback){
	return this.animate({opacity: "show"}, speed, callback);
};

/**
 * Same as fadeIn, but transitions from a visible, to a hidden state.
 *   $("p:visible").fadeOut("slow");
 */
$.fn.fadeOut = function(speed,callback){
	return this.animate({opacity: "hide"}, speed, callback);
};

/**
 * ...
 */
$.fn.fadeTo = function(speed,to,callback){
	return this.animate({opacity: to}, speed, callback);
};

/**
 *
 */
$.fn.animate = function(prop,speed,callback) {
	return this.queue(function(){
		var i = 0;
		for ( var p in prop ) {
			var e = new fx( this, $.speed(speed,callback,i++), p );
			if ( prop[p].constructor == Number )
				e.custom( e.cur(), prop[p] );
			else
				e[ prop[p] ]();
		}
	});
};

$.speed = function(s,o,i) {
	o = o || {};
	
	if ( o.constructor == Function )
		o = { complete: o };
	
	var ss = {"slow":600,"fast":200};
	o.duration = s.constructor == Number ? s : ss[s] || 400;

	// Queueing
	o.oldComplete = o.complete;
	o.complete = function(){
		$.dequeue(this, "fx");
		if ( o.oldComplete && o.oldComplete.constructor == Function )
			o.oldComplete.apply( this );
	};
	
	if ( i > 0 )
		o.complete = null;

	return o;
};

$.queue = {};

$.dequeue = function(elem,type){
	type = type || "fx";

	if ( elem.queue && elem.queue[type] ) {
		// Remove self
		elem.queue[type].shift();

		// Get next function
		var f = elem.queue[type][0];
	
		if ( f )
			f.apply( elem );
	}
};

$.fn.queue = function(type,fn){
	if ( !fn ) {
		fn = type;
		type = "fx";
	}

	return this.each(function(){
		if ( !this.queue )
			this.queue = {};

		if ( !this.queue[type] )
			this.queue[type] = [];

		this.queue[type].push( fn );
	
		if ( this.queue[type].length == 1 )
			fn.apply(this);
	});
};

$.setAuto = function(e,p) {
	var a = e.style[p];
	var o = $.css(e,p);
	e.style[p] = "auto";
	var n = $.css(e,p);
	if ( o != n )
		e.style[p] = a;
};

/*
 * I originally wrote fx() as a clone of moo.fx and in the process
 * of making it small in size the code became illegible to sane
 * people. You've been warned.
 */

$.fx = function( elem, options, prop ){

	var z = this;

	// The users options
	z.o = {
		duration: options.duration || 400,
		complete: options.complete
	};

	// The element
	z.el = elem;

	// The styles
	var y = z.el.style;

	// Simple function for setting a style value
	z.a = function(){
		if ( prop == "opacity" ) {
			if (z.now == 1) z.now = 0.9999;
			if (window.ActiveXObject)
				y.filter = "alpha(opacity=" + z.now*100 + ")";
			y.opacity = z.now;
		} else
			y[prop] = z.now+"px";
	};

	// Figure out the maximum number to run to
	z.max = function(){
		return z.el["orig"+prop] || z.cur();
	};

	// Get the current size
	z.cur = function(){
		return parseFloat( $.css(z.el,prop) );
	};

	// Start an animation from one number to another
	z.custom = function(from,to){
		z.startTime = (new Date()).getTime();
		z.now = from;
		z.a();

		z.timer = setInterval(function(){
			z.step(from, to);
		}, 13);
	};

	// Simple 'show' function
	z.show = function(){
		y.display = "block";
		z.o.auto = true;
		z.custom(0,z.max());
	};

	// Simple 'hide' function
	z.hide = function(){
		// Remember where we started, so that we can go back to it later
		z.el["orig"+prop] = this.cur();

		// Begin the animation
		z.custom(z.cur(),0);
	};

	// IE has trouble with opacity if it doesn't have layout
	if ( $.browser == "msie" && !z.el.currentStyle.hasLayout )
		y.zoom = 1;

	// Remember  the overflow of the element
	z.oldOverflow = y.overflow;

	// Make sure that nothing sneaks out
	y.overflow = "hidden";

	// Each step of an animation
	z.step = function(firstNum, lastNum){
		var t = (new Date()).getTime();

		if (t > z.o.duration + z.startTime) {
			// Stop the timer
			clearInterval(z.timer);
			z.timer = null;

			z.now = lastNum;
			z.a();

			// Reset the overflow
			y.overflow = z.oldOverflow;

			// If the element was shown, and not using a custom number,
			// set its height and/or width to auto
			if ( (prop == "height" || prop == "width") && z.o.auto )
				$.setAuto( z.el, prop );

			// If a callback was provided, execute it
			if( z.o.complete.constructor == Function ) {

				// Yes, this is a weird place for this, but it needs to be executed
				// only once per cluster of effects.
				// If the element is, effectively, hidden - hide it
				if ( y.height == "0px" || y.width == "0px" )
					y.display = "none";

				// Execute the complete function
				z.o.complete.apply( z.el );
			}
		} else {
			// Figure out where in the animation we are and set the number
			var p = (t - this.startTime) / z.o.duration;
			z.now = ((-Math.cos(p*Math.PI)/2) + 0.5) * (lastNum-firstNum) + firstNum;

			// Perform the next step of the animation
			z.a();
		}
	};

};
