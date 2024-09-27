(function() {
  "use strict";
  const PUBLIC_VERSION = "5";
  if (typeof window !== "undefined")
    (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
  const EACH_ITEM_REACTIVE = 1;
  const EACH_INDEX_REACTIVE = 1 << 1;
  const EACH_ITEM_IMMUTABLE = 1 << 4;
  const PROPS_IS_IMMUTABLE = 1;
  const PROPS_IS_RUNES = 1 << 1;
  const PROPS_IS_UPDATED = 1 << 2;
  const PROPS_IS_BINDABLE = 1 << 3;
  const PROPS_IS_LAZY_INITIAL = 1 << 4;
  const TRANSITION_IN = 1;
  const TRANSITION_OUT = 1 << 1;
  const TRANSITION_GLOBAL = 1 << 2;
  const TEMPLATE_FRAGMENT = 1;
  const TEMPLATE_USE_IMPORT_NODE = 1 << 1;
  const UNINITIALIZED = Symbol();
  const DEV = false;
  var is_array = Array.isArray;
  var array_from = Array.from;
  var define_property = Object.defineProperty;
  var get_descriptor = Object.getOwnPropertyDescriptor;
  var get_descriptors = Object.getOwnPropertyDescriptors;
  var object_prototype = Object.prototype;
  var array_prototype = Array.prototype;
  var get_prototype_of = Object.getPrototypeOf;
  function is_function(thing) {
    return typeof thing === "function";
  }
  const noop$1 = () => {
  };
  function run(fn) {
    return fn();
  }
  function run_all(arr) {
    for (var i = 0; i < arr.length; i++) {
      arr[i]();
    }
  }
  const DERIVED = 1 << 1;
  const EFFECT = 1 << 2;
  const RENDER_EFFECT = 1 << 3;
  const BLOCK_EFFECT = 1 << 4;
  const BRANCH_EFFECT = 1 << 5;
  const ROOT_EFFECT = 1 << 6;
  const UNOWNED = 1 << 7;
  const DISCONNECTED = 1 << 8;
  const CLEAN = 1 << 9;
  const DIRTY = 1 << 10;
  const MAYBE_DIRTY = 1 << 11;
  const INERT = 1 << 12;
  const DESTROYED = 1 << 13;
  const EFFECT_RAN = 1 << 14;
  const EFFECT_TRANSPARENT = 1 << 15;
  const LEGACY_DERIVED_PROP = 1 << 16;
  const HEAD_EFFECT = 1 << 18;
  const EFFECT_HAS_DERIVED = 1 << 19;
  const STATE_SYMBOL = Symbol("$state");
  const LOADING_ATTR_SYMBOL = Symbol("");
  function equals(value) {
    return value === this.v;
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
  }
  function safe_equals(value) {
    return !safe_not_equal(value, this.v);
  }
  function effect_in_teardown(rune) {
    {
      throw new Error("effect_in_teardown");
    }
  }
  function effect_in_unowned_derived() {
    {
      throw new Error("effect_in_unowned_derived");
    }
  }
  function effect_orphan(rune) {
    {
      throw new Error("effect_orphan");
    }
  }
  function effect_update_depth_exceeded() {
    {
      throw new Error("effect_update_depth_exceeded");
    }
  }
  function props_invalid_value(key) {
    {
      throw new Error("props_invalid_value");
    }
  }
  function state_descriptors_fixed() {
    {
      throw new Error("state_descriptors_fixed");
    }
  }
  function state_prototype_fixed() {
    {
      throw new Error("state_prototype_fixed");
    }
  }
  function state_unsafe_local_read() {
    {
      throw new Error("state_unsafe_local_read");
    }
  }
  function state_unsafe_mutation() {
    {
      throw new Error("state_unsafe_mutation");
    }
  }
  function source(v) {
    return {
      f: 0,
      // TODO ideally we could skip this altogether, but it causes type errors
      v,
      reactions: null,
      equals,
      version: 0
    };
  }
  // @__NO_SIDE_EFFECTS__
  function mutable_source(initial_value) {
    var _a;
    const s = source(initial_value);
    s.equals = safe_equals;
    if (component_context !== null && component_context.l !== null) {
      ((_a = component_context.l).s ?? (_a.s = [])).push(s);
    }
    return s;
  }
  function mutable_state(v) {
    return /* @__PURE__ */ push_derived_source(/* @__PURE__ */ mutable_source(v));
  }
  // @__NO_SIDE_EFFECTS__
  function push_derived_source(source2) {
    if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
      if (derived_sources === null) {
        set_derived_sources([source2]);
      } else {
        derived_sources.push(source2);
      }
    }
    return source2;
  }
  function set(source2, value) {
    if (active_reaction !== null && is_runes() && (active_reaction.f & DERIVED) !== 0 && // If the source was created locally within the current derived, then
    // we allow the mutation.
    (derived_sources === null || !derived_sources.includes(source2))) {
      state_unsafe_mutation();
    }
    if (!source2.equals(value)) {
      source2.v = value;
      source2.version = increment_version();
      mark_reactions(source2, DIRTY);
      if (is_runes() && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & BRANCH_EFFECT) === 0) {
        if (new_deps !== null && new_deps.includes(source2)) {
          set_signal_status(active_effect, DIRTY);
          schedule_effect(active_effect);
        } else {
          if (untracked_writes === null) {
            set_untracked_writes([source2]);
          } else {
            untracked_writes.push(source2);
          }
        }
      }
    }
    return value;
  }
  function mark_reactions(signal, status) {
    var reactions = signal.reactions;
    if (reactions === null) return;
    var runes = is_runes();
    var length = reactions.length;
    for (var i = 0; i < length; i++) {
      var reaction = reactions[i];
      var flags = reaction.f;
      if ((flags & DIRTY) !== 0) continue;
      if (!runes && reaction === active_effect) continue;
      set_signal_status(reaction, status);
      if ((flags & (CLEAN | UNOWNED)) !== 0) {
        if ((flags & DERIVED) !== 0) {
          mark_reactions(
            /** @type {Derived} */
            reaction,
            MAYBE_DIRTY
          );
        } else {
          schedule_effect(
            /** @type {Effect} */
            reaction
          );
        }
      }
    }
  }
  function validate_effect(rune) {
    if (active_effect === null && active_reaction === null) {
      effect_orphan();
    }
    if (active_reaction !== null && (active_reaction.f & UNOWNED) !== 0) {
      effect_in_unowned_derived();
    }
    if (is_destroying_effect) {
      effect_in_teardown();
    }
  }
  function push_effect(effect2, parent_effect) {
    var parent_last = parent_effect.last;
    if (parent_last === null) {
      parent_effect.last = parent_effect.first = effect2;
    } else {
      parent_last.next = effect2;
      effect2.prev = parent_last;
      parent_effect.last = effect2;
    }
  }
  function create_effect(type, fn, sync, push2 = true) {
    var is_root = (type & ROOT_EFFECT) !== 0;
    var parent_effect = active_effect;
    var effect2 = {
      ctx: component_context,
      deps: null,
      nodes_start: null,
      nodes_end: null,
      f: type | DIRTY,
      first: null,
      fn,
      last: null,
      next: null,
      parent: is_root ? null : parent_effect,
      prev: null,
      teardown: null,
      transitions: null,
      version: 0
    };
    if (sync) {
      var previously_flushing_effect = is_flushing_effect;
      try {
        set_is_flushing_effect(true);
        update_effect(effect2);
        effect2.f |= EFFECT_RAN;
      } catch (e) {
        destroy_effect(effect2);
        throw e;
      } finally {
        set_is_flushing_effect(previously_flushing_effect);
      }
    } else if (fn !== null) {
      schedule_effect(effect2);
    }
    var inert = sync && effect2.deps === null && effect2.first === null && effect2.nodes_start === null && effect2.teardown === null && (effect2.f & EFFECT_HAS_DERIVED) === 0;
    if (!inert && !is_root && push2) {
      if (parent_effect !== null) {
        push_effect(effect2, parent_effect);
      }
      if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
        var derived2 = (
          /** @type {Derived} */
          active_reaction
        );
        (derived2.children ?? (derived2.children = [])).push(effect2);
      }
    }
    return effect2;
  }
  function teardown(fn) {
    const effect2 = create_effect(RENDER_EFFECT, null, false);
    set_signal_status(effect2, CLEAN);
    effect2.teardown = fn;
    return effect2;
  }
  function user_effect(fn) {
    validate_effect();
    var defer = active_effect !== null && (active_effect.f & RENDER_EFFECT) !== 0 && // TODO do we actually need this? removing them changes nothing
    component_context !== null && !component_context.m;
    if (defer) {
      var context = (
        /** @type {ComponentContext} */
        component_context
      );
      (context.e ?? (context.e = [])).push({
        fn,
        effect: active_effect,
        reaction: active_reaction
      });
    } else {
      var signal = effect(fn);
      return signal;
    }
  }
  function user_pre_effect(fn) {
    validate_effect();
    return render_effect(fn);
  }
  function effect_root(fn) {
    const effect2 = create_effect(ROOT_EFFECT, fn, true);
    return () => {
      destroy_effect(effect2);
    };
  }
  function effect(fn) {
    return create_effect(EFFECT, fn, false);
  }
  function legacy_pre_effect(deps, fn) {
    var context = (
      /** @type {ComponentContextLegacy} */
      component_context
    );
    var token = { effect: null, ran: false };
    context.l.r1.push(token);
    token.effect = render_effect(() => {
      deps();
      if (token.ran) return;
      token.ran = true;
      set(context.l.r2, true);
      untrack(fn);
    });
  }
  function legacy_pre_effect_reset() {
    var context = (
      /** @type {ComponentContextLegacy} */
      component_context
    );
    render_effect(() => {
      if (!get$1(context.l.r2)) return;
      for (var token of context.l.r1) {
        var effect2 = token.effect;
        if ((effect2.f & CLEAN) !== 0) {
          set_signal_status(effect2, MAYBE_DIRTY);
        }
        if (check_dirtiness(effect2)) {
          update_effect(effect2);
        }
        token.ran = false;
      }
      context.l.r2.v = false;
    });
  }
  function render_effect(fn) {
    return create_effect(RENDER_EFFECT, fn, true);
  }
  function template_effect(fn) {
    return render_effect(fn);
  }
  function block(fn, flags = 0) {
    return create_effect(RENDER_EFFECT | BLOCK_EFFECT | flags, fn, true);
  }
  function branch(fn, push2 = true) {
    return create_effect(RENDER_EFFECT | BRANCH_EFFECT, fn, true, push2);
  }
  function execute_effect_teardown(effect2) {
    var teardown2 = effect2.teardown;
    if (teardown2 !== null) {
      const previously_destroying_effect = is_destroying_effect;
      const previous_reaction = active_reaction;
      set_is_destroying_effect(true);
      set_active_reaction(null);
      try {
        teardown2.call(null);
      } finally {
        set_is_destroying_effect(previously_destroying_effect);
        set_active_reaction(previous_reaction);
      }
    }
  }
  function destroy_effect(effect2, remove_dom = true) {
    var removed = false;
    if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes_start !== null) {
      var node = effect2.nodes_start;
      var end = effect2.nodes_end;
      while (node !== null) {
        var next = node === end ? null : (
          /** @type {TemplateNode} */
          /* @__PURE__ */ get_next_sibling(node)
        );
        node.remove();
        node = next;
      }
      removed = true;
    }
    destroy_effect_children(effect2, remove_dom && !removed);
    remove_reactions(effect2, 0);
    set_signal_status(effect2, DESTROYED);
    var transitions = effect2.transitions;
    if (transitions !== null) {
      for (const transition2 of transitions) {
        transition2.stop();
      }
    }
    execute_effect_teardown(effect2);
    var parent = effect2.parent;
    if (parent !== null && parent.first !== null) {
      unlink_effect(effect2);
    }
    effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.parent = effect2.fn = effect2.nodes_start = effect2.nodes_end = null;
  }
  function unlink_effect(effect2) {
    var parent = effect2.parent;
    var prev = effect2.prev;
    var next = effect2.next;
    if (prev !== null) prev.next = next;
    if (next !== null) next.prev = prev;
    if (parent !== null) {
      if (parent.first === effect2) parent.first = next;
      if (parent.last === effect2) parent.last = prev;
    }
  }
  function pause_effect(effect2, callback) {
    var transitions = [];
    pause_children(effect2, transitions, true);
    run_out_transitions(transitions, () => {
      destroy_effect(effect2);
      if (callback) callback();
    });
  }
  function run_out_transitions(transitions, fn) {
    var remaining = transitions.length;
    if (remaining > 0) {
      var check = () => --remaining || fn();
      for (var transition2 of transitions) {
        transition2.out(check);
      }
    } else {
      fn();
    }
  }
  function pause_children(effect2, transitions, local) {
    if ((effect2.f & INERT) !== 0) return;
    effect2.f ^= INERT;
    if (effect2.transitions !== null) {
      for (const transition2 of effect2.transitions) {
        if (transition2.is_global || local) {
          transitions.push(transition2);
        }
      }
    }
    var child2 = effect2.first;
    while (child2 !== null) {
      var sibling2 = child2.next;
      var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
      pause_children(child2, transitions, transparent ? local : false);
      child2 = sibling2;
    }
  }
  function resume_effect(effect2) {
    resume_children(effect2, true);
  }
  function resume_children(effect2, local) {
    if ((effect2.f & INERT) === 0) return;
    effect2.f ^= INERT;
    if (check_dirtiness(effect2)) {
      update_effect(effect2);
    }
    var child2 = effect2.first;
    while (child2 !== null) {
      var sibling2 = child2.next;
      var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
      resume_children(child2, transparent ? local : false);
      child2 = sibling2;
    }
    if (effect2.transitions !== null) {
      for (const transition2 of effect2.transitions) {
        if (transition2.is_global || local) {
          transition2.in();
        }
      }
    }
  }
  let is_micro_task_queued$1 = false;
  let current_queued_micro_tasks = [];
  function process_micro_tasks() {
    is_micro_task_queued$1 = false;
    const tasks = current_queued_micro_tasks.slice();
    current_queued_micro_tasks = [];
    run_all(tasks);
  }
  function queue_micro_task(fn) {
    if (!is_micro_task_queued$1) {
      is_micro_task_queued$1 = true;
      queueMicrotask(process_micro_tasks);
    }
    current_queued_micro_tasks.push(fn);
  }
  function flush_tasks() {
    if (is_micro_task_queued$1) {
      process_micro_tasks();
    }
  }
  // @__NO_SIDE_EFFECTS__
  function derived$1(fn) {
    let flags = DERIVED | DIRTY;
    if (active_effect === null) {
      flags |= UNOWNED;
    } else {
      active_effect.f |= EFFECT_HAS_DERIVED;
    }
    const signal = {
      children: null,
      deps: null,
      equals,
      f: flags,
      fn,
      reactions: null,
      v: (
        /** @type {V} */
        null
      ),
      version: 0,
      parent: active_effect
    };
    if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
      var derived2 = (
        /** @type {Derived} */
        active_reaction
      );
      (derived2.children ?? (derived2.children = [])).push(signal);
    }
    return signal;
  }
  // @__NO_SIDE_EFFECTS__
  function derived_safe_equal(fn) {
    const signal = /* @__PURE__ */ derived$1(fn);
    signal.equals = safe_equals;
    return signal;
  }
  function destroy_derived_children(derived2) {
    var children = derived2.children;
    if (children !== null) {
      derived2.children = null;
      for (var i = 0; i < children.length; i += 1) {
        var child2 = children[i];
        if ((child2.f & DERIVED) !== 0) {
          destroy_derived(
            /** @type {Derived} */
            child2
          );
        } else {
          destroy_effect(
            /** @type {Effect} */
            child2
          );
        }
      }
    }
  }
  function update_derived(derived2) {
    var value;
    var prev_active_effect = active_effect;
    set_active_effect(derived2.parent);
    {
      try {
        destroy_derived_children(derived2);
        value = update_reaction(derived2);
      } finally {
        set_active_effect(prev_active_effect);
      }
    }
    var status = (skip_reaction || (derived2.f & UNOWNED) !== 0) && derived2.deps !== null ? MAYBE_DIRTY : CLEAN;
    set_signal_status(derived2, status);
    if (!derived2.equals(value)) {
      derived2.v = value;
      derived2.version = increment_version();
    }
  }
  function destroy_derived(signal) {
    destroy_derived_children(signal);
    remove_reactions(signal, 0);
    set_signal_status(signal, DESTROYED);
    signal.children = signal.deps = signal.reactions = // @ts-expect-error `signal.fn` cannot be `null` while the signal is alive
    signal.fn = null;
  }
  function lifecycle_outside_component(name2) {
    {
      throw new Error("lifecycle_outside_component");
    }
  }
  const FLUSH_MICROTASK = 0;
  const FLUSH_SYNC = 1;
  let scheduler_mode = FLUSH_MICROTASK;
  let is_micro_task_queued = false;
  let is_flushing_effect = false;
  let is_destroying_effect = false;
  function set_is_flushing_effect(value) {
    is_flushing_effect = value;
  }
  function set_is_destroying_effect(value) {
    is_destroying_effect = value;
  }
  let queued_root_effects = [];
  let flush_count = 0;
  let dev_effect_stack = [];
  let active_reaction = null;
  function set_active_reaction(reaction) {
    active_reaction = reaction;
  }
  let active_effect = null;
  function set_active_effect(effect2) {
    active_effect = effect2;
  }
  let derived_sources = null;
  function set_derived_sources(sources) {
    derived_sources = sources;
  }
  let new_deps = null;
  let skipped_deps = 0;
  let untracked_writes = null;
  function set_untracked_writes(value) {
    untracked_writes = value;
  }
  let current_version = 0;
  let skip_reaction = false;
  let component_context = null;
  function increment_version() {
    return ++current_version;
  }
  function is_runes() {
    return component_context !== null && component_context.l === null;
  }
  function check_dirtiness(reaction) {
    var _a, _b;
    var flags = reaction.f;
    if ((flags & DIRTY) !== 0) {
      return true;
    }
    if ((flags & MAYBE_DIRTY) !== 0) {
      var dependencies = reaction.deps;
      var is_unowned = (flags & UNOWNED) !== 0;
      if (dependencies !== null) {
        var i;
        if ((flags & DISCONNECTED) !== 0) {
          for (i = 0; i < dependencies.length; i++) {
            ((_a = dependencies[i]).reactions ?? (_a.reactions = [])).push(reaction);
          }
          reaction.f ^= DISCONNECTED;
        }
        for (i = 0; i < dependencies.length; i++) {
          var dependency = dependencies[i];
          if (check_dirtiness(
            /** @type {Derived} */
            dependency
          )) {
            update_derived(
              /** @type {Derived} */
              dependency
            );
          }
          if (is_unowned && active_effect !== null && !skip_reaction && !((_b = dependency == null ? void 0 : dependency.reactions) == null ? void 0 : _b.includes(reaction))) {
            (dependency.reactions ?? (dependency.reactions = [])).push(reaction);
          }
          if (dependency.version > reaction.version) {
            return true;
          }
        }
      }
      if (!is_unowned) {
        set_signal_status(reaction, CLEAN);
      }
    }
    return false;
  }
  function handle_error(error, effect2, component_context2) {
    {
      throw error;
    }
  }
  function update_reaction(reaction) {
    var _a;
    var previous_deps = new_deps;
    var previous_skipped_deps = skipped_deps;
    var previous_untracked_writes = untracked_writes;
    var previous_reaction = active_reaction;
    var previous_skip_reaction = skip_reaction;
    var prev_derived_sources = derived_sources;
    new_deps = /** @type {null | Value[]} */
    null;
    skipped_deps = 0;
    untracked_writes = null;
    active_reaction = (reaction.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
    skip_reaction = !is_flushing_effect && (reaction.f & UNOWNED) !== 0;
    derived_sources = null;
    try {
      var result = (
        /** @type {Function} */
        (0, reaction.fn)()
      );
      var deps = reaction.deps;
      if (new_deps !== null) {
        var i;
        remove_reactions(reaction, skipped_deps);
        if (deps !== null && skipped_deps > 0) {
          deps.length = skipped_deps + new_deps.length;
          for (i = 0; i < new_deps.length; i++) {
            deps[skipped_deps + i] = new_deps[i];
          }
        } else {
          reaction.deps = deps = new_deps;
        }
        if (!skip_reaction) {
          for (i = skipped_deps; i < deps.length; i++) {
            ((_a = deps[i]).reactions ?? (_a.reactions = [])).push(reaction);
          }
        }
      } else if (deps !== null && skipped_deps < deps.length) {
        remove_reactions(reaction, skipped_deps);
        deps.length = skipped_deps;
      }
      return result;
    } finally {
      new_deps = previous_deps;
      skipped_deps = previous_skipped_deps;
      untracked_writes = previous_untracked_writes;
      active_reaction = previous_reaction;
      skip_reaction = previous_skip_reaction;
      derived_sources = prev_derived_sources;
    }
  }
  function remove_reaction(signal, dependency) {
    let reactions = dependency.reactions;
    if (reactions !== null) {
      var index2 = reactions.indexOf(signal);
      if (index2 !== -1) {
        var new_length = reactions.length - 1;
        if (new_length === 0) {
          reactions = dependency.reactions = null;
        } else {
          reactions[index2] = reactions[new_length];
          reactions.pop();
        }
      }
    }
    if (reactions === null && (dependency.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
    // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
    // allows us to skip the expensive work of disconnecting and immediately reconnecting it
    (new_deps === null || !new_deps.includes(dependency))) {
      set_signal_status(dependency, MAYBE_DIRTY);
      if ((dependency.f & (UNOWNED | DISCONNECTED)) === 0) {
        dependency.f ^= DISCONNECTED;
      }
      remove_reactions(
        /** @type {Derived} **/
        dependency,
        0
      );
    }
  }
  function remove_reactions(signal, start_index) {
    var dependencies = signal.deps;
    if (dependencies === null) return;
    for (var i = start_index; i < dependencies.length; i++) {
      remove_reaction(signal, dependencies[i]);
    }
  }
  function destroy_effect_children(signal, remove_dom = false) {
    var effect2 = signal.first;
    signal.first = signal.last = null;
    while (effect2 !== null) {
      var next = effect2.next;
      destroy_effect(effect2, remove_dom);
      effect2 = next;
    }
  }
  function update_effect(effect2) {
    var flags = effect2.f;
    if ((flags & DESTROYED) !== 0) {
      return;
    }
    set_signal_status(effect2, CLEAN);
    var previous_effect = active_effect;
    var previous_component_context = component_context;
    active_effect = effect2;
    component_context = effect2.ctx;
    try {
      if ((flags & BLOCK_EFFECT) === 0) {
        destroy_effect_children(effect2);
      }
      execute_effect_teardown(effect2);
      var teardown2 = update_reaction(effect2);
      effect2.teardown = typeof teardown2 === "function" ? teardown2 : null;
      effect2.version = current_version;
      if (DEV) ;
    } catch (error) {
      handle_error(
        /** @type {Error} */
        error
      );
    } finally {
      active_effect = previous_effect;
      component_context = previous_component_context;
    }
  }
  function infinite_loop_guard() {
    if (flush_count > 1e3) {
      flush_count = 0;
      {
        effect_update_depth_exceeded();
      }
    }
    flush_count++;
  }
  function flush_queued_root_effects(root_effects) {
    var length = root_effects.length;
    if (length === 0) {
      return;
    }
    infinite_loop_guard();
    var previously_flushing_effect = is_flushing_effect;
    is_flushing_effect = true;
    try {
      for (var i = 0; i < length; i++) {
        var effect2 = root_effects[i];
        if ((effect2.f & CLEAN) === 0) {
          effect2.f ^= CLEAN;
        }
        var collected_effects = [];
        process_effects(effect2, collected_effects);
        flush_queued_effects(collected_effects);
      }
    } finally {
      is_flushing_effect = previously_flushing_effect;
    }
  }
  function flush_queued_effects(effects) {
    var length = effects.length;
    if (length === 0) return;
    for (var i = 0; i < length; i++) {
      var effect2 = effects[i];
      if ((effect2.f & (DESTROYED | INERT)) === 0 && check_dirtiness(effect2)) {
        update_effect(effect2);
        if (effect2.deps === null && effect2.first === null && effect2.nodes_start === null) {
          if (effect2.teardown === null) {
            unlink_effect(effect2);
          } else {
            effect2.fn = null;
          }
        }
      }
    }
  }
  function process_deferred() {
    is_micro_task_queued = false;
    if (flush_count > 1001) {
      return;
    }
    const previous_queued_root_effects = queued_root_effects;
    queued_root_effects = [];
    flush_queued_root_effects(previous_queued_root_effects);
    if (!is_micro_task_queued) {
      flush_count = 0;
    }
  }
  function schedule_effect(signal) {
    if (scheduler_mode === FLUSH_MICROTASK) {
      if (!is_micro_task_queued) {
        is_micro_task_queued = true;
        queueMicrotask(process_deferred);
      }
    }
    var effect2 = signal;
    while (effect2.parent !== null) {
      effect2 = effect2.parent;
      var flags = effect2.f;
      if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
        if ((flags & CLEAN) === 0) return;
        effect2.f ^= CLEAN;
      }
    }
    queued_root_effects.push(effect2);
  }
  function process_effects(effect2, collected_effects) {
    var current_effect = effect2.first;
    var effects = [];
    main_loop: while (current_effect !== null) {
      var flags = current_effect.f;
      var is_branch = (flags & BRANCH_EFFECT) !== 0;
      var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;
      if (!is_skippable_branch && (flags & INERT) === 0) {
        if ((flags & RENDER_EFFECT) !== 0) {
          if (is_branch) {
            current_effect.f ^= CLEAN;
          } else if (check_dirtiness(current_effect)) {
            update_effect(current_effect);
          }
          var child2 = current_effect.first;
          if (child2 !== null) {
            current_effect = child2;
            continue;
          }
        } else if ((flags & EFFECT) !== 0) {
          effects.push(current_effect);
        }
      }
      var sibling2 = current_effect.next;
      if (sibling2 === null) {
        let parent = current_effect.parent;
        while (parent !== null) {
          if (effect2 === parent) {
            break main_loop;
          }
          var parent_sibling = parent.next;
          if (parent_sibling !== null) {
            current_effect = parent_sibling;
            continue main_loop;
          }
          parent = parent.parent;
        }
      }
      current_effect = sibling2;
    }
    for (var i = 0; i < effects.length; i++) {
      child2 = effects[i];
      collected_effects.push(child2);
      process_effects(child2, collected_effects);
    }
  }
  function flush_sync(fn) {
    var previous_scheduler_mode = scheduler_mode;
    var previous_queued_root_effects = queued_root_effects;
    try {
      infinite_loop_guard();
      const root_effects = [];
      scheduler_mode = FLUSH_SYNC;
      queued_root_effects = root_effects;
      is_micro_task_queued = false;
      flush_queued_root_effects(previous_queued_root_effects);
      var result = fn == null ? void 0 : fn();
      flush_tasks();
      if (queued_root_effects.length > 0 || root_effects.length > 0) {
        flush_sync();
      }
      flush_count = 0;
      if (DEV) ;
      return result;
    } finally {
      scheduler_mode = previous_scheduler_mode;
      queued_root_effects = previous_queued_root_effects;
    }
  }
  async function tick() {
    await Promise.resolve();
    flush_sync();
  }
  function get$1(signal) {
    var flags = signal.f;
    if ((flags & DESTROYED) !== 0) {
      return signal.v;
    }
    if (active_reaction !== null) {
      if (derived_sources !== null && derived_sources.includes(signal)) {
        state_unsafe_local_read();
      }
      var deps = active_reaction.deps;
      if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
        skipped_deps++;
      } else if (new_deps === null) {
        new_deps = [signal];
      } else {
        new_deps.push(signal);
      }
      if (untracked_writes !== null && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & BRANCH_EFFECT) === 0 && untracked_writes.includes(signal)) {
        set_signal_status(active_effect, DIRTY);
        schedule_effect(active_effect);
      }
    }
    if ((flags & DERIVED) !== 0) {
      var derived2 = (
        /** @type {Derived} */
        signal
      );
      if (check_dirtiness(derived2)) {
        update_derived(derived2);
      }
    }
    return signal.v;
  }
  function untrack(fn) {
    const previous_reaction = active_reaction;
    try {
      active_reaction = null;
      return fn();
    } finally {
      active_reaction = previous_reaction;
    }
  }
  const STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
  function set_signal_status(signal, status) {
    signal.f = signal.f & STATUS_MASK | status;
  }
  function getContext(key) {
    const context_map = get_or_init_context_map();
    const result = (
      /** @type {T} */
      context_map.get(key)
    );
    return result;
  }
  function setContext(key, context) {
    const context_map = get_or_init_context_map();
    context_map.set(key, context);
    return context;
  }
  function get_or_init_context_map(name2) {
    if (component_context === null) {
      lifecycle_outside_component();
    }
    return component_context.c ?? (component_context.c = new Map(get_parent_context(component_context) || void 0));
  }
  function get_parent_context(component_context2) {
    let parent = component_context2.p;
    while (parent !== null) {
      const context_map = parent.c;
      if (context_map !== null) {
        return context_map;
      }
      parent = parent.p;
    }
    return null;
  }
  function update(signal, d = 1) {
    var value = +get$1(signal);
    set(signal, value + d);
    return value;
  }
  function push(props, runes = false, fn) {
    component_context = {
      p: component_context,
      c: null,
      e: null,
      m: false,
      s: props,
      x: null,
      l: null
    };
    if (!runes) {
      component_context.l = {
        s: null,
        u: null,
        r1: [],
        r2: source(false)
      };
    }
  }
  function pop(component) {
    const context_stack_item = component_context;
    if (context_stack_item !== null) {
      const component_effects = context_stack_item.e;
      if (component_effects !== null) {
        var previous_effect = active_effect;
        var previous_reaction = active_reaction;
        context_stack_item.e = null;
        try {
          for (var i = 0; i < component_effects.length; i++) {
            var component_effect = component_effects[i];
            set_active_effect(component_effect.effect);
            set_active_reaction(component_effect.reaction);
            effect(component_effect.fn);
          }
        } finally {
          set_active_effect(previous_effect);
          set_active_reaction(previous_reaction);
        }
      }
      component_context = context_stack_item.p;
      context_stack_item.m = true;
    }
    return (
      /** @type {T} */
      {}
    );
  }
  function deep_read_state(value) {
    if (typeof value !== "object" || !value || value instanceof EventTarget) {
      return;
    }
    if (STATE_SYMBOL in value) {
      deep_read(value);
    } else if (!Array.isArray(value)) {
      for (let key in value) {
        const prop2 = value[key];
        if (typeof prop2 === "object" && prop2 && STATE_SYMBOL in prop2) {
          deep_read(prop2);
        }
      }
    }
  }
  function deep_read(value, visited = /* @__PURE__ */ new Set()) {
    if (typeof value === "object" && value !== null && // We don't want to traverse DOM elements
    !(value instanceof EventTarget) && !visited.has(value)) {
      visited.add(value);
      if (value instanceof Date) {
        value.getTime();
      }
      for (let key in value) {
        try {
          deep_read(value[key], visited);
        } catch (e) {
        }
      }
      const proto2 = get_prototype_of(value);
      if (proto2 !== Object.prototype && proto2 !== Array.prototype && proto2 !== Map.prototype && proto2 !== Set.prototype && proto2 !== Date.prototype) {
        const descriptors = get_descriptors(proto2);
        for (let key in descriptors) {
          const get2 = descriptors[key].get;
          if (get2) {
            try {
              get2.call(value);
            } catch (e) {
            }
          }
        }
      }
    }
  }
  function proxy(value, parent = null, prev) {
    if (typeof value !== "object" || value === null || STATE_SYMBOL in value) {
      return value;
    }
    const prototype = get_prototype_of(value);
    if (prototype !== object_prototype && prototype !== array_prototype) {
      return value;
    }
    var sources = /* @__PURE__ */ new Map();
    var is_proxied_array = is_array(value);
    var version = source(0);
    if (is_proxied_array) {
      sources.set("length", source(
        /** @type {any[]} */
        value.length
      ));
    }
    var metadata;
    return new Proxy(
      /** @type {any} */
      value,
      {
        defineProperty(_, prop2, descriptor) {
          if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
            state_descriptors_fixed();
          }
          var s = sources.get(prop2);
          if (s === void 0) {
            s = source(descriptor.value);
            sources.set(prop2, s);
          } else {
            set(s, proxy(descriptor.value, metadata));
          }
          return true;
        },
        deleteProperty(target, prop2) {
          var s = sources.get(prop2);
          if (s === void 0) {
            if (prop2 in target) {
              sources.set(prop2, source(UNINITIALIZED));
            }
          } else {
            set(s, UNINITIALIZED);
            update_version(version);
          }
          return true;
        },
        get(target, prop2, receiver) {
          var _a;
          if (prop2 === STATE_SYMBOL) {
            return value;
          }
          var s = sources.get(prop2);
          var exists = prop2 in target;
          if (s === void 0 && (!exists || ((_a = get_descriptor(target, prop2)) == null ? void 0 : _a.writable))) {
            s = source(proxy(exists ? target[prop2] : UNINITIALIZED, metadata));
            sources.set(prop2, s);
          }
          if (s !== void 0) {
            var v = get$1(s);
            return v === UNINITIALIZED ? void 0 : v;
          }
          return Reflect.get(target, prop2, receiver);
        },
        getOwnPropertyDescriptor(target, prop2) {
          var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
          if (descriptor && "value" in descriptor) {
            var s = sources.get(prop2);
            if (s) descriptor.value = get$1(s);
          } else if (descriptor === void 0) {
            var source2 = sources.get(prop2);
            var value2 = source2 == null ? void 0 : source2.v;
            if (source2 !== void 0 && value2 !== UNINITIALIZED) {
              return {
                enumerable: true,
                configurable: true,
                value: value2,
                writable: true
              };
            }
          }
          return descriptor;
        },
        has(target, prop2) {
          var _a;
          if (prop2 === STATE_SYMBOL) {
            return true;
          }
          var s = sources.get(prop2);
          var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop2);
          if (s !== void 0 || active_effect !== null && (!has || ((_a = get_descriptor(target, prop2)) == null ? void 0 : _a.writable))) {
            if (s === void 0) {
              s = source(has ? proxy(target[prop2], metadata) : UNINITIALIZED);
              sources.set(prop2, s);
            }
            var value2 = get$1(s);
            if (value2 === UNINITIALIZED) {
              return false;
            }
          }
          return has;
        },
        set(target, prop2, value2, receiver) {
          var _a;
          var s = sources.get(prop2);
          var has = prop2 in target;
          if (is_proxied_array && prop2 === "length") {
            for (var i = value2; i < /** @type {Source<number>} */
            s.v; i += 1) {
              var other_s = sources.get(i + "");
              if (other_s !== void 0) {
                set(other_s, UNINITIALIZED);
              } else if (i in target) {
                other_s = source(UNINITIALIZED);
                sources.set(i + "", other_s);
              }
            }
          }
          if (s === void 0) {
            if (!has || ((_a = get_descriptor(target, prop2)) == null ? void 0 : _a.writable)) {
              s = source(void 0);
              set(s, proxy(value2, metadata));
              sources.set(prop2, s);
            }
          } else {
            has = s.v !== UNINITIALIZED;
            set(s, proxy(value2, metadata));
          }
          var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
          if (descriptor == null ? void 0 : descriptor.set) {
            descriptor.set.call(receiver, value2);
          }
          if (!has) {
            if (is_proxied_array && typeof prop2 === "string") {
              var ls = (
                /** @type {Source<number>} */
                sources.get("length")
              );
              var n = Number(prop2);
              if (Number.isInteger(n) && n >= ls.v) {
                set(ls, n + 1);
              }
            }
            update_version(version);
          }
          return true;
        },
        ownKeys(target) {
          get$1(version);
          var own_keys = Reflect.ownKeys(target).filter((key2) => {
            var source3 = sources.get(key2);
            return source3 === void 0 || source3.v !== UNINITIALIZED;
          });
          for (var [key, source2] of sources) {
            if (source2.v !== UNINITIALIZED && !(key in target)) {
              own_keys.push(key);
            }
          }
          return own_keys;
        },
        setPrototypeOf() {
          state_prototype_fixed();
        }
      }
    );
  }
  function update_version(signal, d = 1) {
    set(signal, signal.v + d);
  }
  var $window;
  var first_child_getter;
  var next_sibling_getter;
  function init_operations() {
    if ($window !== void 0) {
      return;
    }
    $window = window;
    var element_prototype = Element.prototype;
    var node_prototype = Node.prototype;
    first_child_getter = get_descriptor(node_prototype, "firstChild").get;
    next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
    element_prototype.__click = void 0;
    element_prototype.__className = "";
    element_prototype.__attributes = null;
    element_prototype.__e = void 0;
    Text.prototype.__t = void 0;
  }
  function create_text(value = "") {
    return document.createTextNode(value);
  }
  // @__NO_SIDE_EFFECTS__
  function get_first_child(node) {
    return first_child_getter.call(node);
  }
  // @__NO_SIDE_EFFECTS__
  function get_next_sibling(node) {
    return next_sibling_getter.call(node);
  }
  function child(node) {
    {
      return /* @__PURE__ */ get_first_child(node);
    }
  }
  function first_child(fragment, is_text) {
    {
      var first = (
        /** @type {DocumentFragment} */
        /* @__PURE__ */ get_first_child(
          /** @type {Node} */
          fragment
        )
      );
      if (first instanceof Comment && first.data === "") return /* @__PURE__ */ get_next_sibling(first);
      return first;
    }
  }
  function sibling(node, count = 1, is_text = false) {
    let next_sibling = node;
    while (count--) {
      next_sibling = /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(next_sibling);
    }
    {
      return next_sibling;
    }
  }
  function clear_text_content(node) {
    node.textContent = "";
  }
  let hydrating = false;
  const all_registered_events = /* @__PURE__ */ new Set();
  const root_event_handles = /* @__PURE__ */ new Set();
  function create_event(event_name, dom, handler, options) {
    function target_handler(event2) {
      if (!options.capture) {
        handle_event_propagation.call(dom, event2);
      }
      if (!event2.cancelBubble) {
        return handler.call(this, event2);
      }
    }
    if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") {
      queue_micro_task(() => {
        dom.addEventListener(event_name, target_handler, options);
      });
    } else {
      dom.addEventListener(event_name, target_handler, options);
    }
    return target_handler;
  }
  function event(event_name, dom, handler, capture, passive) {
    var options = { capture, passive };
    var target_handler = create_event(event_name, dom, handler, options);
    if (dom === document.body || dom === window || dom === document) {
      teardown(() => {
        dom.removeEventListener(event_name, target_handler, options);
      });
    }
  }
  function delegate(events) {
    for (var i = 0; i < events.length; i++) {
      all_registered_events.add(events[i]);
    }
    for (var fn of root_event_handles) {
      fn(events);
    }
  }
  function handle_event_propagation(event2) {
    var _a;
    var handler_element = this;
    var owner_document = (
      /** @type {Node} */
      handler_element.ownerDocument
    );
    var event_name = event2.type;
    var path = ((_a = event2.composedPath) == null ? void 0 : _a.call(event2)) || [];
    var current_target = (
      /** @type {null | Element} */
      path[0] || event2.target
    );
    var path_idx = 0;
    var handled_at = event2.__root;
    if (handled_at) {
      var at_idx = path.indexOf(handled_at);
      if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
      window)) {
        event2.__root = handler_element;
        return;
      }
      var handler_idx = path.indexOf(handler_element);
      if (handler_idx === -1) {
        return;
      }
      if (at_idx <= handler_idx) {
        path_idx = at_idx;
      }
    }
    current_target = /** @type {Element} */
    path[path_idx] || event2.target;
    if (current_target === handler_element) return;
    define_property(event2, "currentTarget", {
      configurable: true,
      get() {
        return current_target || owner_document;
      }
    });
    try {
      var throw_error;
      var other_errors = [];
      while (current_target !== null) {
        var parent_element = current_target.assignedSlot || current_target.parentNode || /** @type {any} */
        current_target.host || null;
        try {
          var delegated = current_target["__" + event_name];
          if (delegated !== void 0 && !/** @type {any} */
          current_target.disabled) {
            if (is_array(delegated)) {
              var [fn, ...data] = delegated;
              fn.apply(current_target, [event2, ...data]);
            } else {
              delegated.call(current_target, event2);
            }
          }
        } catch (error) {
          if (throw_error) {
            other_errors.push(error);
          } else {
            throw_error = error;
          }
        }
        if (event2.cancelBubble || parent_element === handler_element || parent_element === null) {
          break;
        }
        current_target = parent_element;
      }
      if (throw_error) {
        for (let error of other_errors) {
          queueMicrotask(() => {
            throw error;
          });
        }
        throw throw_error;
      }
    } finally {
      event2.__root = handler_element;
      delete event2.currentTarget;
    }
  }
  function create_fragment_from_html(html) {
    var elem = document.createElement("template");
    elem.innerHTML = html;
    return elem.content;
  }
  function assign_nodes(start, end) {
    var effect2 = (
      /** @type {Effect} */
      active_effect
    );
    if (effect2.nodes_start === null) {
      effect2.nodes_start = start;
      effect2.nodes_end = end;
    }
  }
  // @__NO_SIDE_EFFECTS__
  function template(content, flags) {
    var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
    var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;
    var node;
    var has_start = !content.startsWith("<!>");
    return () => {
      if (node === void 0) {
        node = create_fragment_from_html(has_start ? content : "<!>" + content);
        if (!is_fragment) node = /** @type {Node} */
        /* @__PURE__ */ get_first_child(node);
      }
      var clone = (
        /** @type {TemplateNode} */
        use_import_node ? document.importNode(node, true) : node.cloneNode(true)
      );
      if (is_fragment) {
        var start = (
          /** @type {TemplateNode} */
          /* @__PURE__ */ get_first_child(clone)
        );
        var end = (
          /** @type {TemplateNode} */
          clone.lastChild
        );
        assign_nodes(start, end);
      } else {
        assign_nodes(clone, clone);
      }
      return clone;
    };
  }
  function text(value = "") {
    {
      var t = create_text(value + "");
      assign_nodes(t, t);
      return t;
    }
  }
  function comment() {
    var frag = document.createDocumentFragment();
    var start = document.createComment("");
    var anchor = create_text();
    frag.append(start, anchor);
    assign_nodes(start, anchor);
    return frag;
  }
  function append(anchor, dom) {
    if (anchor === null) {
      return;
    }
    anchor.before(
      /** @type {Node} */
      dom
    );
  }
  function is_capture_event(name2) {
    return name2.endsWith("capture") && name2 !== "gotpointercapture" && name2 !== "lostpointercapture";
  }
  const DELEGATED_EVENTS = [
    "beforeinput",
    "click",
    "change",
    "dblclick",
    "contextmenu",
    "focusin",
    "focusout",
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerout",
    "pointerover",
    "pointerup",
    "touchend",
    "touchmove",
    "touchstart"
  ];
  function is_delegated(event_name) {
    return DELEGATED_EVENTS.includes(event_name);
  }
  const ATTRIBUTE_ALIASES = {
    // no `class: 'className'` because we handle that separately
    formnovalidate: "formNoValidate",
    ismap: "isMap",
    nomodule: "noModule",
    playsinline: "playsInline",
    readonly: "readOnly"
  };
  function normalize_attribute(name2) {
    name2 = name2.toLowerCase();
    return ATTRIBUTE_ALIASES[name2] ?? name2;
  }
  const PASSIVE_EVENTS = ["touchstart", "touchmove"];
  function is_passive_event(name2) {
    return PASSIVE_EVENTS.includes(name2);
  }
  let should_intro = true;
  function set_text(text2, value) {
    if (value !== (text2.__t ?? (text2.__t = text2.nodeValue))) {
      text2.__t = value;
      text2.nodeValue = value == null ? "" : value + "";
    }
  }
  function mount(component, options) {
    return _mount(component, options);
  }
  const document_listeners = /* @__PURE__ */ new Map();
  function _mount(Component, { target, anchor, props = {}, events, context, intro = true }) {
    init_operations();
    var registered_events = /* @__PURE__ */ new Set();
    var event_handle = (events2) => {
      for (var i = 0; i < events2.length; i++) {
        var event_name = events2[i];
        if (registered_events.has(event_name)) continue;
        registered_events.add(event_name);
        var passive = is_passive_event(event_name);
        target.addEventListener(event_name, handle_event_propagation, { passive });
        var n = document_listeners.get(event_name);
        if (n === void 0) {
          document.addEventListener(event_name, handle_event_propagation, { passive });
          document_listeners.set(event_name, 1);
        } else {
          document_listeners.set(event_name, n + 1);
        }
      }
    };
    event_handle(array_from(all_registered_events));
    root_event_handles.add(event_handle);
    var component = void 0;
    var unmount = effect_root(() => {
      var anchor_node = anchor ?? target.appendChild(create_text());
      branch(() => {
        if (context) {
          push({});
          var ctx = (
            /** @type {ComponentContext} */
            component_context
          );
          ctx.c = context;
        }
        if (events) {
          props.$$events = events;
        }
        should_intro = intro;
        component = Component(anchor_node, props) || {};
        should_intro = true;
        if (context) {
          pop();
        }
      });
      return () => {
        var _a;
        for (var event_name of registered_events) {
          target.removeEventListener(event_name, handle_event_propagation);
          var n = (
            /** @type {number} */
            document_listeners.get(event_name)
          );
          if (--n === 0) {
            document.removeEventListener(event_name, handle_event_propagation);
            document_listeners.delete(event_name);
          } else {
            document_listeners.set(event_name, n);
          }
        }
        root_event_handles.delete(event_handle);
        mounted_components.delete(component);
        if (anchor_node !== anchor) {
          (_a = anchor_node.parentNode) == null ? void 0 : _a.removeChild(anchor_node);
        }
      };
    });
    mounted_components.set(component, unmount);
    return component;
  }
  let mounted_components = /* @__PURE__ */ new WeakMap();
  function if_block(node, get_condition, consequent_fn, alternate_fn = null, elseif = false) {
    var anchor = node;
    var consequent_effect = null;
    var alternate_effect = null;
    var condition = null;
    var flags = elseif ? EFFECT_TRANSPARENT : 0;
    block(() => {
      if (condition === (condition = !!get_condition())) return;
      if (condition) {
        if (consequent_effect) {
          resume_effect(consequent_effect);
        } else {
          consequent_effect = branch(() => consequent_fn(anchor));
        }
        if (alternate_effect) {
          pause_effect(alternate_effect, () => {
            alternate_effect = null;
          });
        }
      } else {
        if (alternate_effect) {
          resume_effect(alternate_effect);
        } else if (alternate_fn) {
          alternate_effect = branch(() => alternate_fn(anchor));
        }
        if (consequent_effect) {
          pause_effect(consequent_effect, () => {
            consequent_effect = null;
          });
        }
      }
    }, flags);
  }
  let current_each_item = null;
  function index(_, i) {
    return i;
  }
  function pause_effects(state, items, controlled_anchor, items_map) {
    var transitions = [];
    var length = items.length;
    for (var i = 0; i < length; i++) {
      pause_children(items[i].e, transitions, true);
    }
    var is_controlled = length > 0 && transitions.length === 0 && controlled_anchor !== null;
    if (is_controlled) {
      var parent_node = (
        /** @type {Element} */
        /** @type {Element} */
        controlled_anchor.parentNode
      );
      clear_text_content(parent_node);
      parent_node.append(
        /** @type {Element} */
        controlled_anchor
      );
      items_map.clear();
      link(state, items[0].prev, items[length - 1].next);
    }
    run_out_transitions(transitions, () => {
      for (var i2 = 0; i2 < length; i2++) {
        var item = items[i2];
        if (!is_controlled) {
          items_map.delete(item.k);
          link(state, item.prev, item.next);
        }
        destroy_effect(item.e, !is_controlled);
      }
    });
  }
  function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
    var anchor = node;
    var state = { flags, items: /* @__PURE__ */ new Map(), first: null };
    var fallback = null;
    block(() => {
      var collection = get_collection();
      var array = is_array(collection) ? collection : collection == null ? [] : array_from(collection);
      var length = array.length;
      {
        reconcile(array, state, anchor, render_fn, flags, get_key);
      }
      if (fallback_fn !== null) {
        if (length === 0) {
          if (fallback) {
            resume_effect(fallback);
          } else {
            fallback = branch(() => fallback_fn(anchor));
          }
        } else if (fallback !== null) {
          pause_effect(fallback, () => {
            fallback = null;
          });
        }
      }
    });
  }
  function reconcile(array, state, anchor, render_fn, flags, get_key) {
    var length = array.length;
    var items = state.items;
    var first = state.first;
    var current = first;
    var seen;
    var prev = null;
    var matched = [];
    var stashed = [];
    var value;
    var key;
    var item;
    var i;
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key = get_key(value, i);
      item = items.get(key);
      if (item === void 0) {
        var child_anchor = current ? (
          /** @type {TemplateNode} */
          current.e.nodes_start
        ) : anchor;
        prev = create_item(
          child_anchor,
          state,
          prev,
          prev === null ? state.first : prev.next,
          value,
          key,
          i,
          render_fn,
          flags
        );
        items.set(key, prev);
        matched = [];
        stashed = [];
        current = prev.next;
        continue;
      }
      {
        update_item(item, value, i);
      }
      if ((item.e.f & INERT) !== 0) {
        resume_effect(item.e);
      }
      if (item !== current) {
        if (seen !== void 0 && seen.has(item)) {
          if (matched.length < stashed.length) {
            var start = stashed[0];
            var j;
            prev = start.prev;
            var a = matched[0];
            var b = matched[matched.length - 1];
            for (j = 0; j < matched.length; j += 1) {
              move(matched[j], start, anchor);
            }
            for (j = 0; j < stashed.length; j += 1) {
              seen.delete(stashed[j]);
            }
            link(state, a.prev, b.next);
            link(state, prev, a);
            link(state, b, start);
            current = start;
            prev = b;
            i -= 1;
            matched = [];
            stashed = [];
          } else {
            seen.delete(item);
            move(item, current, anchor);
            link(state, item.prev, item.next);
            link(state, item, prev === null ? state.first : prev.next);
            link(state, prev, item);
            prev = item;
          }
          continue;
        }
        matched = [];
        stashed = [];
        while (current !== null && current.k !== key) {
          if ((current.e.f & INERT) === 0) {
            (seen ?? (seen = /* @__PURE__ */ new Set())).add(current);
          }
          stashed.push(current);
          current = current.next;
        }
        if (current === null) {
          continue;
        }
        item = current;
      }
      matched.push(item);
      prev = item;
      current = item.next;
    }
    if (current !== null || seen !== void 0) {
      var to_destroy = seen === void 0 ? [] : array_from(seen);
      while (current !== null) {
        to_destroy.push(current);
        current = current.next;
      }
      var destroy_length = to_destroy.length;
      if (destroy_length > 0) {
        var controlled_anchor = null;
        pause_effects(state, to_destroy, controlled_anchor, items);
      }
    }
    active_effect.first = state.first && state.first.e;
    active_effect.last = prev && prev.e;
  }
  function update_item(item, value, index2, type) {
    {
      set(item.v, value);
    }
    {
      item.i = index2;
    }
  }
  function create_item(anchor, state, prev, next, value, key, index2, render_fn, flags) {
    var previous_each_item = current_each_item;
    try {
      var reactive = (flags & EACH_ITEM_REACTIVE) !== 0;
      var mutable = (flags & EACH_ITEM_IMMUTABLE) === 0;
      var v = reactive ? mutable ? /* @__PURE__ */ mutable_source(value) : source(value) : value;
      var i = (flags & EACH_INDEX_REACTIVE) === 0 ? index2 : source(index2);
      var item = {
        i,
        v,
        k: key,
        a: null,
        // @ts-expect-error
        e: null,
        prev,
        next
      };
      current_each_item = item;
      item.e = branch(() => render_fn(anchor, v, i), hydrating);
      item.e.prev = prev && prev.e;
      item.e.next = next && next.e;
      if (prev === null) {
        state.first = item;
      } else {
        prev.next = item;
        prev.e.next = item.e;
      }
      if (next !== null) {
        next.prev = item;
        next.e.prev = item.e;
      }
      return item;
    } finally {
      current_each_item = previous_each_item;
    }
  }
  function move(item, next, anchor) {
    var end = item.next ? (
      /** @type {TemplateNode} */
      item.next.e.nodes_start
    ) : anchor;
    var dest = next ? (
      /** @type {TemplateNode} */
      next.e.nodes_start
    ) : anchor;
    var node = (
      /** @type {TemplateNode} */
      item.e.nodes_start
    );
    while (node !== end) {
      var next_node = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(node)
      );
      dest.before(node);
      node = next_node;
    }
  }
  function link(state, prev, next) {
    if (prev === null) {
      state.first = next;
    } else {
      prev.next = next;
      prev.e.next = next && next.e;
    }
    if (next !== null) {
      next.prev = prev;
      next.e.prev = prev && prev.e;
    }
  }
  function slot(anchor, slot_fn, slot_props, fallback_fn) {
    if (slot_fn === void 0) ;
    else {
      slot_fn(anchor, slot_props);
    }
  }
  function action(dom, action2, get_value) {
    effect(() => {
      var payload = untrack(() => action2(dom, get_value == null ? void 0 : get_value()) || {});
      if (payload == null ? void 0 : payload.destroy) {
        return () => (
          /** @type {Function} */
          payload.destroy()
        );
      }
    });
  }
  function autofocus(dom, value) {
    if (value) {
      const body = document.body;
      dom.autofocus = true;
      queue_micro_task(() => {
        if (document.activeElement === body) {
          dom.focus();
        }
      });
    }
  }
  function set_attribute(element, attribute, value, skip_warning) {
    var attributes = element.__attributes ?? (element.__attributes = {});
    if (attributes[attribute] === (attributes[attribute] = value)) return;
    if (attribute === "loading") {
      element[LOADING_ATTR_SYMBOL] = value;
    }
    if (value == null) {
      element.removeAttribute(attribute);
    } else if (typeof value !== "string" && get_setters(element).includes(attribute)) {
      element[attribute] = value;
    } else {
      element.setAttribute(attribute, value);
    }
  }
  function set_attributes(element, prev, next, css_hash, preserve_attribute_case = false, is_custom_element = false, skip_warning = false) {
    var current = prev || {};
    var is_option_element = element.tagName === "OPTION";
    for (var key in prev) {
      if (!(key in next)) {
        next[key] = null;
      }
    }
    var setters = get_setters(element);
    var attributes = (
      /** @type {Record<string, unknown>} **/
      element.__attributes ?? (element.__attributes = {})
    );
    var events = [];
    for (const key2 in next) {
      let value = next[key2];
      if (is_option_element && key2 === "value" && value == null) {
        element.value = element.__value = "";
        current[key2] = value;
        continue;
      }
      var prev_value = current[key2];
      if (value === prev_value) continue;
      current[key2] = value;
      var prefix = key2[0] + key2[1];
      if (prefix === "$$") continue;
      if (prefix === "on") {
        const opts = {};
        const event_handle_key = "$$" + key2;
        let event_name = key2.slice(2);
        var delegated = is_delegated(event_name);
        if (is_capture_event(event_name)) {
          event_name = event_name.slice(0, -7);
          opts.capture = true;
        }
        if (!delegated && prev_value) {
          if (value != null) continue;
          element.removeEventListener(event_name, current[event_handle_key], opts);
          current[event_handle_key] = null;
        }
        if (value != null) {
          if (!delegated) {
            let handle = function(evt) {
              current[key2].call(this, evt);
            };
            if (!prev) {
              events.push([
                key2,
                value,
                () => current[event_handle_key] = create_event(event_name, element, handle, opts)
              ]);
            } else {
              current[event_handle_key] = create_event(event_name, element, handle, opts);
            }
          } else {
            element[`__${event_name}`] = value;
            delegate([event_name]);
          }
        }
      } else if (key2 === "style" && value != null) {
        element.style.cssText = value + "";
      } else if (key2 === "autofocus") {
        autofocus(
          /** @type {HTMLElement} */
          element,
          Boolean(value)
        );
      } else if (key2 === "__value" || key2 === "value" && value != null) {
        element.value = element[key2] = element.__value = value;
      } else {
        var name2 = key2;
        if (!preserve_attribute_case) {
          name2 = normalize_attribute(name2);
        }
        if (value == null && !is_custom_element) {
          attributes[key2] = null;
          element.removeAttribute(key2);
        } else if (setters.includes(name2) && (is_custom_element || typeof value !== "string")) {
          element[name2] = value;
        } else if (typeof value !== "function") {
          {
            set_attribute(element, name2, value);
          }
        }
      }
    }
    if (!prev) {
      queue_micro_task(() => {
        if (!element.isConnected) return;
        for (const [key2, value, evt] of events) {
          if (current[key2] === value) {
            evt();
          }
        }
      });
    }
    return current;
  }
  var setters_cache = /* @__PURE__ */ new Map();
  function get_setters(element) {
    var setters = setters_cache.get(element.nodeName);
    if (setters) return setters;
    setters_cache.set(element.nodeName, setters = []);
    var descriptors;
    var proto2 = get_prototype_of(element);
    while (proto2.constructor.name !== "Element") {
      descriptors = get_descriptors(proto2);
      for (var key in descriptors) {
        if (descriptors[key].set) {
          setters.push(key);
        }
      }
      proto2 = get_prototype_of(proto2);
    }
    return setters;
  }
  const request_animation_frame = requestAnimationFrame;
  const now = () => performance.now();
  const raf = {
    tick: (
      /** @param {any} _ */
      (_) => request_animation_frame(_)
    ),
    now: () => now(),
    tasks: /* @__PURE__ */ new Set()
  };
  function run_tasks(now2) {
    raf.tasks.forEach((task) => {
      if (!task.c(now2)) {
        raf.tasks.delete(task);
        task.f();
      }
    });
    if (raf.tasks.size !== 0) {
      raf.tick(run_tasks);
    }
  }
  function loop(callback) {
    let task;
    if (raf.tasks.size === 0) {
      raf.tick(run_tasks);
    }
    return {
      promise: new Promise((fulfill) => {
        raf.tasks.add(task = { c: callback, f: fulfill });
      }),
      abort() {
        raf.tasks.delete(task);
      }
    };
  }
  function dispatch_event(element, type) {
    element.dispatchEvent(new CustomEvent(type));
  }
  function css_style_from_camel_case(style) {
    const parts = style.split("-");
    if (parts.length === 1) return parts[0];
    return parts[0] + parts.slice(1).map(
      /** @param {any} word */
      (word) => word[0].toUpperCase() + word.slice(1)
    ).join("");
  }
  function css_to_keyframe(css) {
    const keyframe = {};
    const parts = css.split(";");
    for (const part of parts) {
      const [property, value] = part.split(":");
      if (!property || value === void 0) break;
      const formatted_property = css_style_from_camel_case(property.trim());
      keyframe[formatted_property] = value.trim();
    }
    return keyframe;
  }
  const linear = (t) => t;
  function transition(flags, element, get_fn, get_params) {
    var is_intro = (flags & TRANSITION_IN) !== 0;
    var is_outro = (flags & TRANSITION_OUT) !== 0;
    var is_both = is_intro && is_outro;
    var is_global = (flags & TRANSITION_GLOBAL) !== 0;
    var direction = is_both ? "both" : is_intro ? "in" : "out";
    var current_options;
    var inert = element.inert;
    var intro;
    var outro;
    function get_options() {
      return current_options ?? (current_options = get_fn()(element, (get_params == null ? void 0 : get_params()) ?? /** @type {P} */
      {}, {
        direction
      }));
    }
    var transition2 = {
      is_global,
      in() {
        var _a;
        element.inert = inert;
        if (!is_intro) {
          outro == null ? void 0 : outro.abort();
          (_a = outro == null ? void 0 : outro.reset) == null ? void 0 : _a.call(outro);
          return;
        }
        if (!is_outro) {
          intro == null ? void 0 : intro.abort();
        }
        dispatch_event(element, "introstart");
        intro = animate(element, get_options(), outro, 1, () => {
          dispatch_event(element, "introend");
          intro == null ? void 0 : intro.abort();
          intro = current_options = void 0;
        });
      },
      out(fn) {
        if (!is_outro) {
          fn == null ? void 0 : fn();
          current_options = void 0;
          return;
        }
        element.inert = true;
        dispatch_event(element, "outrostart");
        outro = animate(element, get_options(), intro, 0, () => {
          dispatch_event(element, "outroend");
          fn == null ? void 0 : fn();
        });
      },
      stop: () => {
        intro == null ? void 0 : intro.abort();
        outro == null ? void 0 : outro.abort();
      }
    };
    var e = (
      /** @type {Effect} */
      active_effect
    );
    (e.transitions ?? (e.transitions = [])).push(transition2);
    if (is_intro && should_intro) {
      var run2 = is_global;
      if (!run2) {
        var block2 = (
          /** @type {Effect | null} */
          e.parent
        );
        while (block2 && (block2.f & EFFECT_TRANSPARENT) !== 0) {
          while (block2 = block2.parent) {
            if ((block2.f & BLOCK_EFFECT) !== 0) break;
          }
        }
        run2 = !block2 || (block2.f & EFFECT_RAN) !== 0;
      }
      if (run2) {
        effect(() => {
          untrack(() => transition2.in());
        });
      }
    }
  }
  function animate(element, options, counterpart, t2, on_finish) {
    var is_intro = t2 === 1;
    if (is_function(options)) {
      var a;
      var aborted = false;
      queue_micro_task(() => {
        if (aborted) return;
        var o = options({ direction: is_intro ? "in" : "out" });
        a = animate(element, o, counterpart, t2, on_finish);
      });
      return {
        abort: () => {
          aborted = true;
          a == null ? void 0 : a.abort();
        },
        deactivate: () => a.deactivate(),
        reset: () => a.reset(),
        t: () => a.t()
      };
    }
    counterpart == null ? void 0 : counterpart.deactivate();
    if (!(options == null ? void 0 : options.duration)) {
      on_finish();
      return {
        abort: noop$1,
        deactivate: noop$1,
        reset: noop$1,
        t: () => t2
      };
    }
    const { delay = 0, css, tick: tick2, easing = linear } = options;
    var keyframes = [];
    if (is_intro && counterpart === void 0) {
      if (tick2) {
        tick2(0, 1);
      }
      if (css) {
        var styles = css_to_keyframe(css(0, 1));
        keyframes.push(styles, styles);
      }
    }
    var get_t = () => 1 - t2;
    var animation = element.animate(keyframes, { duration: delay });
    animation.onfinish = () => {
      var t1 = (counterpart == null ? void 0 : counterpart.t()) ?? 1 - t2;
      counterpart == null ? void 0 : counterpart.abort();
      var delta = t2 - t1;
      var duration = (
        /** @type {number} */
        options.duration * Math.abs(delta)
      );
      var keyframes2 = [];
      if (duration > 0) {
        if (css) {
          var n = Math.ceil(duration / (1e3 / 60));
          for (var i = 0; i <= n; i += 1) {
            var t = t1 + delta * easing(i / n);
            var styles2 = css(t, 1 - t);
            keyframes2.push(css_to_keyframe(styles2));
          }
        }
        get_t = () => {
          var time = (
            /** @type {number} */
            /** @type {globalThis.Animation} */
            animation.currentTime
          );
          return t1 + delta * easing(time / duration);
        };
        if (tick2) {
          loop(() => {
            if (animation.playState !== "running") return false;
            var t3 = get_t();
            tick2(t3, 1 - t3);
            return true;
          });
        }
      }
      animation = element.animate(keyframes2, { duration, fill: "forwards" });
      animation.onfinish = () => {
        get_t = () => t2;
        tick2 == null ? void 0 : tick2(t2, 1 - t2);
        on_finish();
      };
    };
    return {
      abort: () => {
        if (animation) {
          animation.cancel();
          animation.effect = null;
        }
      },
      deactivate: () => {
        on_finish = noop$1;
      },
      reset: () => {
        if (t2 === 0) {
          tick2 == null ? void 0 : tick2(1, 0);
        }
      },
      t: () => get_t()
    };
  }
  function is_bound_this(bound_value, element_or_component) {
    return bound_value === element_or_component || (bound_value == null ? void 0 : bound_value[STATE_SYMBOL]) === element_or_component;
  }
  function bind_this(element_or_component = {}, update2, get_value, get_parts) {
    effect(() => {
      var old_parts;
      var parts;
      render_effect(() => {
        old_parts = parts;
        parts = [];
        untrack(() => {
          if (element_or_component !== get_value(...parts)) {
            update2(element_or_component, ...parts);
            if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
              update2(null, ...old_parts);
            }
          }
        });
      });
      return () => {
        queue_micro_task(() => {
          if (parts && is_bound_this(get_value(...parts), element_or_component)) {
            update2(null, ...parts);
          }
        });
      };
    });
    return element_or_component;
  }
  function init() {
    const context = (
      /** @type {ComponentContextLegacy} */
      component_context
    );
    const callbacks = context.l.u;
    if (!callbacks) return;
    if (callbacks.b.length) {
      user_pre_effect(() => {
        observe_all(context);
        run_all(callbacks.b);
      });
    }
    user_effect(() => {
      const fns = untrack(() => callbacks.m.map(run));
      return () => {
        for (const fn of fns) {
          if (typeof fn === "function") {
            fn();
          }
        }
      };
    });
    if (callbacks.a.length) {
      user_effect(() => {
        observe_all(context);
        run_all(callbacks.a);
      });
    }
  }
  function observe_all(context) {
    if (context.l.s) {
      for (const signal of context.l.s) get$1(signal);
    }
    deep_read_state(context.s);
  }
  function default_slot($$props) {
    var _a;
    var children = (_a = $$props.$$slots) == null ? void 0 : _a.default;
    if (children === true) {
      return $$props.children;
    } else {
      return children;
    }
  }
  const legacy_rest_props_handler = {
    get(target, key) {
      if (target.exclude.includes(key)) return;
      get$1(target.version);
      return key in target.special ? target.special[key]() : target.props[key];
    },
    set(target, key, value) {
      if (!(key in target.special)) {
        target.special[key] = prop(
          {
            get [key]() {
              return target.props[key];
            }
          },
          /** @type {string} */
          key,
          PROPS_IS_UPDATED
        );
      }
      target.special[key](value);
      update(target.version);
      return true;
    },
    getOwnPropertyDescriptor(target, key) {
      if (target.exclude.includes(key)) return;
      if (key in target.props) {
        return {
          enumerable: true,
          configurable: true,
          value: target.props[key]
        };
      }
    },
    deleteProperty(target, key) {
      if (target.exclude.includes(key)) return true;
      target.exclude.push(key);
      update(target.version);
      return true;
    },
    has(target, key) {
      if (target.exclude.includes(key)) return false;
      return key in target.props;
    },
    ownKeys(target) {
      return Reflect.ownKeys(target.props).filter((key) => !target.exclude.includes(key));
    }
  };
  function legacy_rest_props(props, exclude) {
    return new Proxy({ props, exclude, special: {}, version: source(0) }, legacy_rest_props_handler);
  }
  function prop(props, key, flags, fallback) {
    var _a;
    var immutable = (flags & PROPS_IS_IMMUTABLE) !== 0;
    var runes = (flags & PROPS_IS_RUNES) !== 0;
    var bindable = (flags & PROPS_IS_BINDABLE) !== 0;
    var lazy = (flags & PROPS_IS_LAZY_INITIAL) !== 0;
    var prop_value = (
      /** @type {V} */
      props[key]
    );
    var setter = (_a = get_descriptor(props, key)) == null ? void 0 : _a.set;
    var fallback_value = (
      /** @type {V} */
      fallback
    );
    var fallback_dirty = true;
    var fallback_used = false;
    var get_fallback = () => {
      fallback_used = true;
      if (fallback_dirty) {
        fallback_dirty = false;
        if (lazy) {
          fallback_value = untrack(
            /** @type {() => V} */
            fallback
          );
        } else {
          fallback_value = /** @type {V} */
          fallback;
        }
      }
      return fallback_value;
    };
    if (prop_value === void 0 && fallback !== void 0) {
      if (setter && runes) {
        props_invalid_value();
      }
      prop_value = get_fallback();
      if (setter) setter(prop_value);
    }
    var getter;
    if (runes) {
      getter = () => {
        var value = (
          /** @type {V} */
          props[key]
        );
        if (value === void 0) return get_fallback();
        fallback_dirty = true;
        fallback_used = false;
        return value;
      };
    } else {
      var derived_getter = (immutable ? derived$1 : derived_safe_equal)(
        () => (
          /** @type {V} */
          props[key]
        )
      );
      derived_getter.f |= LEGACY_DERIVED_PROP;
      getter = () => {
        var value = get$1(derived_getter);
        if (value !== void 0) fallback_value = /** @type {V} */
        void 0;
        return value === void 0 ? fallback_value : value;
      };
    }
    if ((flags & PROPS_IS_UPDATED) === 0) {
      return getter;
    }
    if (setter) {
      var legacy_parent = props.$$legacy;
      return function(value, mutation) {
        if (arguments.length > 0) {
          if (!runes || !mutation || legacy_parent) {
            setter(mutation ? getter() : value);
          }
          return value;
        } else {
          return getter();
        }
      };
    }
    var from_child = false;
    var inner_current_value = /* @__PURE__ */ mutable_source(prop_value);
    var current_value = /* @__PURE__ */ derived$1(() => {
      var parent_value = getter();
      var child_value = get$1(inner_current_value);
      if (from_child) {
        from_child = false;
        return child_value;
      }
      return inner_current_value.v = parent_value;
    });
    if (!immutable) current_value.equals = safe_equals;
    return function(value, mutation) {
      var current = get$1(current_value);
      if (arguments.length > 0) {
        const new_value = mutation ? get$1(current_value) : runes && bindable ? proxy(value) : value;
        if (!current_value.equals(new_value)) {
          from_child = true;
          set(inner_current_value, new_value);
          if (fallback_used && fallback_value !== void 0) {
            fallback_value = new_value;
          }
          get$1(current_value);
        }
        return value;
      }
      return current;
    };
  }
  function subscribe_to_store(store, run2, invalidate) {
    if (store == null) {
      run2(void 0);
      if (invalidate) invalidate(void 0);
      return noop$1;
    }
    const unsub = store.subscribe(
      run2,
      // @ts-expect-error
      invalidate
    );
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }
  function store_get(store, store_name, stores) {
    const entry = stores[store_name] ?? (stores[store_name] = {
      store: null,
      source: /* @__PURE__ */ mutable_source(void 0),
      unsubscribe: noop$1
    });
    if (entry.store !== store) {
      entry.unsubscribe();
      entry.store = store ?? null;
      if (store == null) {
        entry.source.v = void 0;
        entry.unsubscribe = noop$1;
      } else {
        var is_synchronous_callback = true;
        entry.unsubscribe = subscribe_to_store(store, (v) => {
          if (is_synchronous_callback) {
            entry.source.v = v;
          } else {
            set(entry.source, v);
          }
        });
        is_synchronous_callback = false;
      }
    }
    return get$1(entry.source);
  }
  function setup_stores() {
    const stores = {};
    teardown(() => {
      for (var store_name in stores) {
        const ref = stores[store_name];
        ref.unsubscribe();
      }
    });
    return stores;
  }
  function styleToString(style) {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === void 0)
        return str;
      return str + `${key}:${style[key]};`;
    }, "");
  }
  function disabledAttr(disabled) {
    return disabled ? true : void 0;
  }
  ({
    type: "hidden",
    "aria-hidden": true,
    hidden: true,
    tabIndex: -1,
    style: styleToString({
      position: "absolute",
      opacity: 0,
      "pointer-events": "none",
      margin: 0,
      transform: "translateX(-100%)"
    })
  });
  const subscriber_queue = [];
  function readable(value, start) {
    return {
      subscribe: writable(value, start).subscribe
    };
  }
  function writable(value, start = noop$1) {
    let stop = null;
    const subscribers = /* @__PURE__ */ new Set();
    function set2(new_value) {
      if (safe_not_equal(value, new_value)) {
        value = new_value;
        if (stop) {
          const run_queue = !subscriber_queue.length;
          for (const subscriber of subscribers) {
            subscriber[1]();
            subscriber_queue.push(subscriber, value);
          }
          if (run_queue) {
            for (let i = 0; i < subscriber_queue.length; i += 2) {
              subscriber_queue[i][0](subscriber_queue[i + 1]);
            }
            subscriber_queue.length = 0;
          }
        }
      }
    }
    function update2(fn) {
      set2(fn(
        /** @type {T} */
        value
      ));
    }
    function subscribe(run2, invalidate = noop$1) {
      const subscriber = [run2, invalidate];
      subscribers.add(subscriber);
      if (subscribers.size === 1) {
        stop = start(set2, update2) || noop$1;
      }
      run2(
        /** @type {T} */
        value
      );
      return () => {
        subscribers.delete(subscriber);
        if (subscribers.size === 0 && stop) {
          stop();
          stop = null;
        }
      };
    }
    return { set: set2, update: update2, subscribe };
  }
  function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single ? [stores] : stores;
    if (!stores_array.every(Boolean)) {
      throw new Error("derived() expects stores as input, got a falsy value");
    }
    const auto = fn.length < 2;
    return readable(initial_value, (set2, update2) => {
      let started = false;
      const values = [];
      let pending = 0;
      let cleanup = noop$1;
      const sync = () => {
        if (pending) {
          return;
        }
        cleanup();
        const result = fn(single ? values[0] : values, set2, update2);
        if (auto) {
          set2(result);
        } else {
          cleanup = typeof result === "function" ? result : noop$1;
        }
      };
      const unsubscribers = stores_array.map(
        (store, i) => subscribe_to_store(
          store,
          (value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (started) {
              sync();
            }
          },
          () => {
            pending |= 1 << i;
          }
        )
      );
      started = true;
      sync();
      return function stop() {
        run_all(unsubscribers);
        cleanup();
        started = false;
      };
    });
  }
  function get(store) {
    let value;
    subscribe_to_store(store, (_) => value = _)();
    return value;
  }
  function lightable(value) {
    function subscribe(run2) {
      run2(value);
      return () => {
      };
    }
    return { subscribe };
  }
  function getElementByMeltId(id) {
    if (!isBrowser)
      return null;
    const el = document.querySelector(`[data-melt-id="${id}"]`);
    return isHTMLElement(el) ? el : null;
  }
  const hiddenAction = (obj) => {
    return new Proxy(obj, {
      get(target, prop2, receiver) {
        return Reflect.get(target, prop2, receiver);
      },
      ownKeys(target) {
        return Reflect.ownKeys(target).filter((key) => key !== "action");
      }
    });
  };
  const isFunctionWithParams = (fn) => {
    return typeof fn === "function";
  };
  makeElement("empty");
  function makeElement(name2, args) {
    const { stores, action: action2, returned } = args ?? {};
    const derivedStore = (() => {
      if (stores && returned) {
        return derived(stores, (values) => {
          const result = returned(values);
          if (isFunctionWithParams(result)) {
            const fn = (...args2) => {
              return hiddenAction({
                ...result(...args2),
                [`data-melt-${name2}`]: "",
                action: action2 ?? noop
              });
            };
            fn.action = action2 ?? noop;
            return fn;
          }
          return hiddenAction({
            ...result,
            [`data-melt-${name2}`]: "",
            action: action2 ?? noop
          });
        });
      } else {
        const returnedFn = returned;
        const result = returnedFn == null ? void 0 : returnedFn();
        if (isFunctionWithParams(result)) {
          const resultFn = (...args2) => {
            return hiddenAction({
              ...result(...args2),
              [`data-melt-${name2}`]: "",
              action: action2 ?? noop
            });
          };
          resultFn.action = action2 ?? noop;
          return lightable(resultFn);
        }
        return lightable(hiddenAction({
          ...result,
          [`data-melt-${name2}`]: "",
          action: action2 ?? noop
        }));
      }
    })();
    const actionFn = action2 ?? (() => {
    });
    actionFn.subscribe = derivedStore.subscribe;
    return actionFn;
  }
  function createElHelpers(prefix) {
    const name2 = (part) => part ? `${prefix}-${part}` : prefix;
    const attribute = (part) => `data-melt-${prefix}${part ? `-${part}` : ""}`;
    const selector2 = (part) => `[data-melt-${prefix}${part ? `-${part}` : ""}]`;
    const getEl = (part) => document.querySelector(selector2(part));
    return {
      name: name2,
      attribute,
      selector: selector2,
      getEl
    };
  }
  const isBrowser = typeof document !== "undefined";
  function isHTMLElement(element) {
    return element instanceof HTMLElement;
  }
  function executeCallbacks(...callbacks) {
    return (...args) => {
      for (const callback of callbacks) {
        if (typeof callback === "function") {
          callback(...args);
        }
      }
    };
  }
  function noop() {
  }
  function addEventListener(target, event2, handler, options) {
    const events = Array.isArray(event2) ? event2 : [event2];
    events.forEach((_event) => target.addEventListener(_event, handler, options));
    return () => {
      events.forEach((_event) => target.removeEventListener(_event, handler, options));
    };
  }
  function addMeltEventListener(target, event2, handler, options) {
    const events = Array.isArray(event2) ? event2 : [event2];
    if (typeof handler === "function") {
      const handlerWithMelt = withMelt((_event) => handler(_event));
      events.forEach((_event) => target.addEventListener(_event, handlerWithMelt, options));
      return () => {
        events.forEach((_event) => target.removeEventListener(_event, handlerWithMelt, options));
      };
    }
    return () => noop();
  }
  function dispatchMeltEvent(originalEvent) {
    const node = originalEvent.currentTarget;
    if (!isHTMLElement(node))
      return null;
    const customMeltEvent = new CustomEvent(`m-${originalEvent.type}`, {
      detail: {
        originalEvent
      },
      cancelable: true
    });
    node.dispatchEvent(customMeltEvent);
    return customMeltEvent;
  }
  function withMelt(handler) {
    return (event2) => {
      const customEvent = dispatchMeltEvent(event2);
      if (customEvent == null ? void 0 : customEvent.defaultPrevented)
        return;
      return handler(event2);
    };
  }
  function create_custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    return new CustomEvent(type, { detail, bubbles, cancelable });
  }
  function createEventDispatcher() {
    const active_component_context = component_context;
    if (active_component_context === null) {
      lifecycle_outside_component();
    }
    return (type, detail, options) => {
      var _a;
      const events = (
        /** @type {Record<string, Function | Function[]>} */
        (_a = active_component_context.s.$$events) == null ? void 0 : _a[
          /** @type {any} */
          type
        ]
      );
      if (events) {
        const callbacks = is_array(events) ? events.slice() : [events];
        const event2 = create_custom_event(
          /** @type {string} */
          type,
          detail,
          options
        );
        for (const fn of callbacks) {
          fn.call(active_component_context.x, event2);
        }
        return !event2.defaultPrevented;
      }
      return true;
    };
  }
  function omit(obj, ...keys) {
    const result = {};
    for (const key of Object.keys(obj)) {
      if (!keys.includes(key)) {
        result[key] = obj[key];
      }
    }
    return result;
  }
  function withGet(store) {
    return {
      ...store,
      get: () => get(store)
    };
  }
  withGet.writable = function(initial) {
    const internal = writable(initial);
    let value = initial;
    return {
      subscribe: internal.subscribe,
      set(newValue) {
        internal.set(newValue);
        value = newValue;
      },
      update(updater) {
        const newValue = updater(value);
        internal.set(newValue);
        value = newValue;
      },
      get() {
        return value;
      }
    };
  };
  withGet.derived = function(stores, fn) {
    const subscribers = /* @__PURE__ */ new Map();
    const get2 = () => {
      const values = Array.isArray(stores) ? stores.map((store) => store.get()) : stores.get();
      return fn(values);
    };
    const subscribe = (subscriber) => {
      const unsubscribers = [];
      const storesArr = Array.isArray(stores) ? stores : [stores];
      storesArr.forEach((store) => {
        unsubscribers.push(store.subscribe(() => {
          subscriber(get2());
        }));
      });
      subscriber(get2());
      subscribers.set(subscriber, unsubscribers);
      return () => {
        const unsubscribers2 = subscribers.get(subscriber);
        if (unsubscribers2) {
          for (const unsubscribe of unsubscribers2) {
            unsubscribe();
          }
        }
        subscribers.delete(subscriber);
      };
    };
    return {
      get: get2,
      subscribe
    };
  };
  const overridable = (_store, onChange) => {
    const store = withGet(_store);
    const update2 = (updater, sideEffect) => {
      store.update((curr) => {
        const next = updater(curr);
        let res = next;
        if (onChange) {
          res = onChange({ curr, next });
        }
        sideEffect == null ? void 0 : sideEffect(res);
        return res;
      });
    };
    const set2 = (curr) => {
      update2(() => curr);
    };
    return {
      ...store,
      update: update2,
      set: set2
    };
  };
  let urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  let nanoid = (size = 21) => {
    let id = "";
    let i = size;
    while (i--) {
      id += urlAlphabet[Math.random() * 64 | 0];
    }
    return id;
  };
  function generateId() {
    return nanoid(10);
  }
  function generateIds(args) {
    return args.reduce((acc, curr) => {
      acc[curr] = generateId();
      return acc;
    }, {});
  }
  const kbd = {
    ALT: "Alt",
    ARROW_DOWN: "ArrowDown",
    ARROW_LEFT: "ArrowLeft",
    ARROW_RIGHT: "ArrowRight",
    ARROW_UP: "ArrowUp",
    BACKSPACE: "Backspace",
    CAPS_LOCK: "CapsLock",
    CONTROL: "Control",
    DELETE: "Delete",
    END: "End",
    ENTER: "Enter",
    ESCAPE: "Escape",
    F1: "F1",
    F10: "F10",
    F11: "F11",
    F12: "F12",
    F2: "F2",
    F3: "F3",
    F4: "F4",
    F5: "F5",
    F6: "F6",
    F7: "F7",
    F8: "F8",
    F9: "F9",
    HOME: "Home",
    META: "Meta",
    PAGE_DOWN: "PageDown",
    PAGE_UP: "PageUp",
    SHIFT: "Shift",
    SPACE: " ",
    TAB: "Tab",
    CTRL: "Control",
    ASTERISK: "*",
    A: "a",
    P: "p"
  };
  function toWritableStores(properties) {
    const result = {};
    Object.keys(properties).forEach((key) => {
      const propertyKey = key;
      const value = properties[propertyKey];
      result[propertyKey] = withGet(writable(value));
    });
    return result;
  }
  const { name, selector } = createElHelpers("accordion");
  const defaults$1 = {
    multiple: false,
    disabled: false,
    forceVisible: false
  };
  const createAccordion = (props) => {
    const withDefaults = { ...defaults$1, ...props };
    const options = toWritableStores(omit(withDefaults, "value", "onValueChange", "defaultValue"));
    const meltIds = generateIds(["root"]);
    const { disabled, forceVisible } = options;
    const valueWritable = withDefaults.value ?? writable(withDefaults.defaultValue);
    const value = overridable(valueWritable, withDefaults == null ? void 0 : withDefaults.onValueChange);
    const isSelected = (key, v) => {
      if (v === void 0)
        return false;
      if (typeof v === "string")
        return v === key;
      return v.includes(key);
    };
    const isSelectedStore = derived(value, ($value) => {
      return (key) => isSelected(key, $value);
    });
    const root = makeElement(name(), {
      returned: () => ({
        "data-melt-id": meltIds.root
      })
    });
    const parseItemProps = (props2) => {
      if (typeof props2 === "string") {
        return { value: props2 };
      } else {
        return props2;
      }
    };
    const parseHeadingProps = (props2) => {
      if (typeof props2 === "number") {
        return { level: props2 };
      } else {
        return props2;
      }
    };
    const item = makeElement(name("item"), {
      stores: value,
      returned: ($value) => {
        return (props2) => {
          const { value: itemValue, disabled: disabled2 } = parseItemProps(props2);
          return {
            "data-state": isSelected(itemValue, $value) ? "open" : "closed",
            "data-disabled": disabledAttr(disabled2)
          };
        };
      }
    });
    const trigger = makeElement(name("trigger"), {
      stores: [value, disabled],
      returned: ([$value, $disabled]) => {
        return (props2) => {
          const { value: itemValue, disabled: disabled2 } = parseItemProps(props2);
          return {
            disabled: disabledAttr($disabled || disabled2),
            "aria-expanded": isSelected(itemValue, $value) ? true : false,
            "aria-disabled": disabled2 ? true : false,
            "data-disabled": disabledAttr(disabled2),
            "data-value": itemValue,
            "data-state": isSelected(itemValue, $value) ? "open" : "closed"
          };
        };
      },
      action: (node) => {
        const unsub = executeCallbacks(addMeltEventListener(node, "click", () => {
          const disabled2 = node.dataset.disabled === "true";
          const itemValue = node.dataset.value;
          if (disabled2 || !itemValue)
            return;
          handleValueUpdate(itemValue);
        }), addMeltEventListener(node, "keydown", (e) => {
          if (![kbd.ARROW_DOWN, kbd.ARROW_UP, kbd.HOME, kbd.END].includes(e.key)) {
            return;
          }
          e.preventDefault();
          if (e.key === kbd.SPACE || e.key === kbd.ENTER) {
            const disabled2 = node.dataset.disabled === "true";
            const itemValue = node.dataset.value;
            if (disabled2 || !itemValue)
              return;
            handleValueUpdate(itemValue);
            return;
          }
          const el = e.target;
          const rootEl = getElementByMeltId(meltIds.root);
          if (!rootEl || !isHTMLElement(el))
            return;
          const items = Array.from(rootEl.querySelectorAll(selector("trigger")));
          const candidateItems = items.filter((item2) => {
            if (!isHTMLElement(item2))
              return false;
            return item2.dataset.disabled !== "true";
          });
          if (!candidateItems.length)
            return;
          const elIdx = candidateItems.indexOf(el);
          if (e.key === kbd.ARROW_DOWN) {
            candidateItems[(elIdx + 1) % candidateItems.length].focus();
          }
          if (e.key === kbd.ARROW_UP) {
            candidateItems[(elIdx - 1 + candidateItems.length) % candidateItems.length].focus();
          }
          if (e.key === kbd.HOME) {
            candidateItems[0].focus();
          }
          if (e.key === kbd.END) {
            candidateItems[candidateItems.length - 1].focus();
          }
        }));
        return {
          destroy: unsub
        };
      }
    });
    const content = makeElement(name("content"), {
      stores: [value, disabled, forceVisible],
      returned: ([$value, $disabled, $forceVisible]) => {
        return (props2) => {
          const { value: itemValue } = parseItemProps(props2);
          const isVisible = isSelected(itemValue, $value) || $forceVisible;
          return {
            "data-state": isVisible ? "open" : "closed",
            "data-disabled": disabledAttr($disabled),
            "data-value": itemValue,
            hidden: isVisible ? void 0 : true,
            style: styleToString({
              display: isVisible ? void 0 : "none"
            })
          };
        };
      },
      action: (node) => {
        tick().then(() => {
          const contentId = generateId();
          const triggerId = generateId();
          const parentTrigger = document.querySelector(`${selector("trigger")}, [data-value="${node.dataset.value}"]`);
          if (!isHTMLElement(parentTrigger))
            return;
          node.id = contentId;
          parentTrigger.setAttribute("aria-controls", contentId);
          parentTrigger.id = triggerId;
        });
      }
    });
    const heading = makeElement(name("heading"), {
      returned: () => {
        return (props2) => {
          const { level } = parseHeadingProps(props2);
          return {
            role: "heading",
            "aria-level": level,
            "data-heading-level": level
          };
        };
      }
    });
    function handleValueUpdate(itemValue) {
      value.update(($value) => {
        if ($value === void 0) {
          return withDefaults.multiple ? [itemValue] : itemValue;
        }
        if (Array.isArray($value)) {
          if ($value.includes(itemValue)) {
            return $value.filter((v) => v !== itemValue);
          }
          $value.push(itemValue);
          return $value;
        }
        return $value === itemValue ? void 0 : itemValue;
      });
    }
    return {
      ids: meltIds,
      elements: {
        root,
        item,
        trigger,
        content,
        heading
      },
      states: {
        value
      },
      helpers: {
        isSelected: isSelectedStore
      },
      options
    };
  };
  readable(void 0, (set2) => {
    function clicked(event2) {
      set2(event2);
      set2(void 0);
    }
    const unsubscribe = addEventListener(document, "pointerup", clicked, {
      passive: false,
      capture: true
    });
    return unsubscribe;
  });
  readable(void 0, (set2) => {
    function keydown(event2) {
      if (event2 && event2.key === kbd.ESCAPE) {
        set2(event2);
      }
      set2(void 0);
    }
    const unsubscribe = addEventListener(document, "keydown", keydown, {
      passive: false
    });
    return unsubscribe;
  });
  ({
    prefix: "",
    disabled: readable(false),
    required: readable(false),
    name: readable(void 0)
  });
  const defaults = {
    isDateDisabled: void 0,
    isDateUnavailable: void 0,
    value: void 0,
    preventDeselect: false,
    numberOfMonths: 1,
    pagedNavigation: false,
    weekStartsOn: 0,
    fixedWeeks: false,
    calendarLabel: "Event Date",
    locale: "en",
    minValue: void 0,
    maxValue: void 0,
    disabled: false,
    readonly: false,
    weekdayFormat: "narrow"
  };
  ({
    isDateDisabled: void 0,
    isDateUnavailable: void 0,
    value: void 0,
    positioning: {
      placement: "bottom"
    },
    closeOnEscape: true,
    closeOnOutsideClick: true,
    onOutsideClick: void 0,
    preventScroll: false,
    forceVisible: false,
    locale: "en",
    granularity: void 0,
    disabled: false,
    readonly: false,
    minValue: void 0,
    maxValue: void 0,
    weekdayFormat: "narrow",
    ...omit(defaults, "isDateDisabled", "isDateUnavailable", "value", "locale", "disabled", "readonly", "minValue", "maxValue", "weekdayFormat")
  });
  function createBitAttrs(bit, parts) {
    const attrs = {};
    parts.forEach((part) => {
      attrs[part] = {
        [`data-${bit}-${part}`]: ""
      };
    });
    return (part) => attrs[part];
  }
  function createDispatcher() {
    const dispatch = createEventDispatcher();
    return (e) => {
      const { originalEvent } = e.detail;
      const { cancelable } = e;
      const type = originalEvent.type;
      const shouldContinue = dispatch(type, { originalEvent, currentTarget: originalEvent.currentTarget }, { cancelable });
      if (!shouldContinue) {
        e.preventDefault();
      }
    };
  }
  function removeUndefined(obj) {
    const result = {};
    for (const key in obj) {
      const value = obj[key];
      if (value !== void 0) {
        result[key] = value;
      }
    }
    return result;
  }
  function getOptionUpdater(options) {
    return function(key, value) {
      if (value === void 0)
        return;
      const store = options[key];
      if (store) {
        store.set(value);
      }
    };
  }
  function getAccordionData() {
    const NAME = "accordion";
    const ITEM_NAME = "accordion-item";
    const PARTS = ["root", "content", "header", "item", "trigger"];
    return { NAME, ITEM_NAME, PARTS };
  }
  function setCtx(props) {
    const initAccordion = createAccordion(removeUndefined(props));
    const { NAME, PARTS } = getAccordionData();
    const getAttrs = createBitAttrs(NAME, PARTS);
    const accordion = {
      ...initAccordion,
      getAttrs,
      updateOption: getOptionUpdater(initAccordion.options)
    };
    setContext(NAME, accordion);
    return accordion;
  }
  function getCtx() {
    const { NAME } = getAccordionData();
    return getContext(NAME);
  }
  function setItem(props) {
    const { ITEM_NAME } = getAccordionData();
    const propsStore = writable(props);
    setContext(ITEM_NAME, { propsStore });
    const ctx = getCtx();
    return { ...ctx, propsStore };
  }
  function getItemProps() {
    const { ITEM_NAME } = getAccordionData();
    return getContext(ITEM_NAME);
  }
  function getContent() {
    const ctx = getCtx();
    const { propsStore } = getItemProps();
    return {
      ...ctx,
      propsStore
    };
  }
  function getTrigger() {
    const ctx = getCtx();
    const { propsStore } = getItemProps();
    return {
      ...ctx,
      props: propsStore
    };
  }
  function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return arr1.every((value, index2) => value === arr2[index2]);
  }
  var root_3$2 = /* @__PURE__ */ template(`<div><!></div>`);
  function Accordion($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    const $$restProps = legacy_rest_props($$sanitized_props, [
      "multiple",
      "value",
      "onValueChange",
      "disabled",
      "asChild",
      "el"
    ]);
    push($$props, false);
    const $$stores = setup_stores();
    const $root = () => store_get(root, "$root", $$stores);
    const builder = mutable_state();
    let multiple = prop($$props, "multiple", 8, false);
    let value = prop($$props, "value", 28, () => void 0);
    let onValueChange = prop($$props, "onValueChange", 24, () => void 0);
    let disabled = prop($$props, "disabled", 8, false);
    let asChild = prop($$props, "asChild", 8, false);
    let el = prop($$props, "el", 28, () => void 0);
    const {
      elements: { root },
      states: { value: localValue },
      updateOption,
      getAttrs
    } = setCtx({
      multiple: multiple(),
      disabled: disabled(),
      defaultValue: value(),
      onValueChange: ({ next }) => {
        var _a, _b;
        if (Array.isArray(next)) {
          if (!Array.isArray(value()) || !arraysAreEqual(value(), next)) {
            (_a = onValueChange()) == null ? void 0 : _a(next);
            value(next);
            return next;
          }
          return next;
        }
        if (value() !== next) {
          (_b = onValueChange()) == null ? void 0 : _b(next);
          value(next);
        }
        return next;
      }
    });
    const attrs = getAttrs("root");
    legacy_pre_effect(() => deep_read_state(value()), () => {
      value() !== void 0 && localValue.set(Array.isArray(value()) ? [...value()] : value());
    });
    legacy_pre_effect(() => deep_read_state(multiple()), () => {
      updateOption("multiple", multiple());
    });
    legacy_pre_effect(() => deep_read_state(disabled()), () => {
      updateOption("disabled", disabled());
    });
    legacy_pre_effect(() => $root(), () => {
      set(builder, $root());
    });
    legacy_pre_effect(() => get$1(builder), () => {
      Object.assign(get$1(builder), attrs);
    });
    legacy_pre_effect_reset();
    init();
    var fragment = comment();
    var node = first_child(fragment);
    if_block(
      node,
      asChild,
      ($$anchor2) => {
        var fragment_1 = comment();
        var node_1 = first_child(fragment_1);
        slot(
          node_1,
          default_slot($$props),
          {
            get builder() {
              return get$1(builder);
            }
          }
        );
        append($$anchor2, fragment_1);
      },
      ($$anchor2) => {
        var div = root_3$2();
        bind_this(div, ($$value) => el($$value), () => el());
        let attributes;
        var node_2 = child(div);
        slot(
          node_2,
          default_slot($$props),
          {
            get builder() {
              return get$1(builder);
            }
          }
        );
        template_effect(() => attributes = set_attributes(div, attributes, { ...get$1(builder), ...$$restProps }));
        action(div, ($$node) => get$1(builder).action($$node));
        append($$anchor2, div);
      }
    );
    append($$anchor, fragment);
    pop();
  }
  var root_2$2 = /* @__PURE__ */ template(`<div><!></div>`);
  function Accordion_item($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    const $$restProps = legacy_rest_props($$sanitized_props, ["value", "disabled", "asChild", "el"]);
    push($$props, false);
    const $$stores = setup_stores();
    const $item = () => store_get(item, "$item", $$stores);
    const $propsStore = () => store_get(propsStore, "$propsStore", $$stores);
    const builder = mutable_state();
    let value = prop($$props, "value", 8);
    let disabled = prop($$props, "disabled", 24, () => void 0);
    let asChild = prop($$props, "asChild", 8, false);
    let el = prop($$props, "el", 28, () => void 0);
    const { elements: { item }, propsStore, getAttrs } = setItem({ value: value(), disabled: disabled() });
    const attrs = getAttrs("item");
    legacy_pre_effect(
      () => (deep_read_state(value()), deep_read_state(disabled())),
      () => {
        propsStore.set({ value: value(), disabled: disabled() });
      }
    );
    legacy_pre_effect(
      () => ($item(), $propsStore(), deep_read_state(disabled())),
      () => {
        set(builder, $item()({
          ...$propsStore(),
          disabled: disabled()
        }));
      }
    );
    legacy_pre_effect(() => get$1(builder), () => {
      Object.assign(get$1(builder), attrs);
    });
    legacy_pre_effect_reset();
    init();
    var fragment = comment();
    var node = first_child(fragment);
    if_block(
      node,
      asChild,
      ($$anchor2) => {
        var fragment_1 = comment();
        var node_1 = first_child(fragment_1);
        slot(
          node_1,
          default_slot($$props),
          {
            get builder() {
              return get$1(builder);
            }
          }
        );
        append($$anchor2, fragment_1);
      },
      ($$anchor2) => {
        var div = root_2$2();
        bind_this(div, ($$value) => el($$value), () => el());
        let attributes;
        var node_2 = child(div);
        slot(
          node_2,
          default_slot($$props),
          {
            get builder() {
              return get$1(builder);
            }
          }
        );
        template_effect(() => attributes = set_attributes(div, attributes, { ...get$1(builder), ...$$restProps }));
        action(div, ($$node) => get$1(builder).action($$node));
        append($$anchor2, div);
      }
    );
    append($$anchor, fragment);
    pop();
  }
  var root_2$1 = /* @__PURE__ */ template(`<div><!></div>`);
  function Accordion_header($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    const $$restProps = legacy_rest_props($$sanitized_props, ["level", "asChild", "el"]);
    push($$props, false);
    const $$stores = setup_stores();
    const $header = () => store_get(header, "$header", $$stores);
    const builder = mutable_state();
    let level = prop($$props, "level", 8, 3);
    let asChild = prop($$props, "asChild", 8, false);
    let el = prop($$props, "el", 28, () => void 0);
    const { elements: { heading: header }, getAttrs } = getCtx();
    const attrs = getAttrs("header");
    legacy_pre_effect(
      () => ($header(), deep_read_state(level())),
      () => {
        set(builder, $header()(level()));
      }
    );
    legacy_pre_effect(() => get$1(builder), () => {
      Object.assign(get$1(builder), attrs);
    });
    legacy_pre_effect_reset();
    init();
    var fragment = comment();
    var node = first_child(fragment);
    if_block(
      node,
      asChild,
      ($$anchor2) => {
        var fragment_1 = comment();
        var node_1 = first_child(fragment_1);
        slot(
          node_1,
          default_slot($$props),
          {
            get builder() {
              return get$1(builder);
            }
          }
        );
        append($$anchor2, fragment_1);
      },
      ($$anchor2) => {
        var div = root_2$1();
        bind_this(div, ($$value) => el($$value), () => el());
        let attributes;
        var node_2 = child(div);
        slot(
          node_2,
          default_slot($$props),
          {
            get builder() {
              return get$1(builder);
            }
          }
        );
        template_effect(() => attributes = set_attributes(div, attributes, { ...get$1(builder), ...$$restProps }));
        action(div, ($$node) => get$1(builder).action($$node));
        append($$anchor2, div);
      }
    );
    append($$anchor, fragment);
    pop();
  }
  var root_2 = /* @__PURE__ */ template(`<button><!></button>`);
  function Accordion_trigger($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    const $$restProps = legacy_rest_props($$sanitized_props, ["asChild", "el"]);
    push($$props, false);
    const $$stores = setup_stores();
    const $trigger = () => store_get(trigger, "$trigger", $$stores);
    const $props = () => store_get(props, "$props", $$stores);
    const builder = mutable_state();
    let asChild = prop($$props, "asChild", 8, false);
    let el = prop($$props, "el", 28, () => void 0);
    const { elements: { trigger }, props, getAttrs } = getTrigger();
    const dispatch = createDispatcher();
    const attrs = getAttrs("trigger");
    legacy_pre_effect(() => ($trigger(), $props()), () => {
      set(builder, $trigger()({ ...$props() }));
    });
    legacy_pre_effect(() => get$1(builder), () => {
      Object.assign(get$1(builder), attrs);
    });
    legacy_pre_effect_reset();
    init();
    var fragment = comment();
    var node = first_child(fragment);
    if_block(
      node,
      asChild,
      ($$anchor2) => {
        var fragment_1 = comment();
        var node_1 = first_child(fragment_1);
        slot(
          node_1,
          default_slot($$props),
          {
            get builder() {
              return get$1(builder);
            }
          }
        );
        append($$anchor2, fragment_1);
      },
      ($$anchor2) => {
        var button = root_2();
        bind_this(button, ($$value) => el($$value), () => el());
        let attributes;
        var node_2 = child(button);
        slot(
          node_2,
          default_slot($$props),
          {
            get builder() {
              return get$1(builder);
            }
          }
        );
        template_effect(() => attributes = set_attributes(button, attributes, {
          ...get$1(builder),
          type: "button",
          ...$$restProps
        }));
        action(button, ($$node) => get$1(builder).action($$node));
        effect(() => event("m-keydown", button, dispatch));
        effect(() => event("m-click", button, dispatch));
        append($$anchor2, button);
      }
    );
    append($$anchor, fragment);
    pop();
  }
  var root_3$1 = /* @__PURE__ */ template(`<div><!></div>`);
  var root_5 = /* @__PURE__ */ template(`<div><!></div>`);
  var root_7 = /* @__PURE__ */ template(`<div><!></div>`);
  var root_9 = /* @__PURE__ */ template(`<div><!></div>`);
  var root_11 = /* @__PURE__ */ template(`<div><!></div>`);
  function Accordion_content($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    const $$restProps = legacy_rest_props($$sanitized_props, [
      "transition",
      "transitionConfig",
      "inTransition",
      "inTransitionConfig",
      "outTransition",
      "outTransitionConfig",
      "asChild",
      "el"
    ]);
    push($$props, false);
    const $$stores = setup_stores();
    const $content = () => store_get(content, "$content", $$stores);
    const $propsStore = () => store_get(propsStore, "$propsStore", $$stores);
    const $isSelected = () => store_get(isSelected, "$isSelected", $$stores);
    const builder = mutable_state();
    let transition$1 = prop($$props, "transition", 24, () => void 0);
    let transitionConfig = prop($$props, "transitionConfig", 24, () => void 0);
    let inTransition = prop($$props, "inTransition", 24, () => void 0);
    let inTransitionConfig = prop($$props, "inTransitionConfig", 24, () => void 0);
    let outTransition = prop($$props, "outTransition", 24, () => void 0);
    let outTransitionConfig = prop($$props, "outTransitionConfig", 24, () => void 0);
    let asChild = prop($$props, "asChild", 8, false);
    let el = prop($$props, "el", 28, () => void 0);
    const {
      elements: { content },
      helpers: { isSelected },
      propsStore,
      getAttrs
    } = getContent();
    const attrs = getAttrs("content");
    legacy_pre_effect(() => ($content(), $propsStore()), () => {
      set(builder, $content()({ ...$propsStore() }));
    });
    legacy_pre_effect(() => get$1(builder), () => {
      Object.assign(get$1(builder), attrs);
    });
    legacy_pre_effect_reset();
    init();
    var fragment = comment();
    var node = first_child(fragment);
    if_block(
      node,
      () => asChild() && $isSelected()($propsStore().value),
      ($$anchor2) => {
        var fragment_1 = comment();
        var node_1 = first_child(fragment_1);
        slot(
          node_1,
          default_slot($$props),
          {
            get builder() {
              return get$1(builder);
            }
          }
        );
        append($$anchor2, fragment_1);
      },
      ($$anchor2) => {
        var fragment_2 = comment();
        var node_2 = first_child(fragment_2);
        if_block(
          node_2,
          () => transition$1() && $isSelected()($propsStore().value),
          ($$anchor3) => {
            var div = root_3$1();
            bind_this(div, ($$value) => el($$value), () => el());
            let attributes;
            var node_3 = child(div);
            slot(
              node_3,
              default_slot($$props),
              {
                get builder() {
                  return get$1(builder);
                }
              }
            );
            template_effect(() => attributes = set_attributes(div, attributes, { ...get$1(builder), ...$$restProps }));
            transition(3, div, transition$1, transitionConfig);
            action(div, ($$node) => get$1(builder).action($$node));
            append($$anchor3, div);
          },
          ($$anchor3) => {
            var fragment_3 = comment();
            var node_4 = first_child(fragment_3);
            if_block(
              node_4,
              () => inTransition() && outTransition() && $isSelected()($propsStore().value),
              ($$anchor4) => {
                var div_1 = root_5();
                bind_this(div_1, ($$value) => el($$value), () => el());
                let attributes_1;
                var node_5 = child(div_1);
                slot(
                  node_5,
                  default_slot($$props),
                  {
                    get builder() {
                      return get$1(builder);
                    }
                  }
                );
                template_effect(() => attributes_1 = set_attributes(div_1, attributes_1, { ...get$1(builder), ...$$restProps }));
                transition(1, div_1, inTransition, inTransitionConfig);
                transition(2, div_1, outTransition, outTransitionConfig);
                action(div_1, ($$node) => get$1(builder).action($$node));
                append($$anchor4, div_1);
              },
              ($$anchor4) => {
                var fragment_4 = comment();
                var node_6 = first_child(fragment_4);
                if_block(
                  node_6,
                  () => inTransition() && $isSelected()($propsStore().value),
                  ($$anchor5) => {
                    var div_2 = root_7();
                    bind_this(div_2, ($$value) => el($$value), () => el());
                    let attributes_2;
                    var node_7 = child(div_2);
                    slot(
                      node_7,
                      default_slot($$props),
                      {
                        get builder() {
                          return get$1(builder);
                        }
                      }
                    );
                    template_effect(() => attributes_2 = set_attributes(div_2, attributes_2, { ...get$1(builder), ...$$restProps }));
                    transition(1, div_2, inTransition, inTransitionConfig);
                    action(div_2, ($$node) => get$1(builder).action($$node));
                    append($$anchor5, div_2);
                  },
                  ($$anchor5) => {
                    var fragment_5 = comment();
                    var node_8 = first_child(fragment_5);
                    if_block(
                      node_8,
                      () => outTransition() && $isSelected()($propsStore().value),
                      ($$anchor6) => {
                        var div_3 = root_9();
                        bind_this(div_3, ($$value) => el($$value), () => el());
                        let attributes_3;
                        var node_9 = child(div_3);
                        slot(
                          node_9,
                          default_slot($$props),
                          {
                            get builder() {
                              return get$1(builder);
                            }
                          }
                        );
                        template_effect(() => attributes_3 = set_attributes(div_3, attributes_3, { ...get$1(builder), ...$$restProps }));
                        transition(2, div_3, outTransition, outTransitionConfig);
                        action(div_3, ($$node) => get$1(builder).action($$node));
                        append($$anchor6, div_3);
                      },
                      ($$anchor6) => {
                        var fragment_6 = comment();
                        var node_10 = first_child(fragment_6);
                        if_block(
                          node_10,
                          () => $isSelected()($propsStore().value),
                          ($$anchor7) => {
                            var div_4 = root_11();
                            bind_this(div_4, ($$value) => el($$value), () => el());
                            let attributes_4;
                            var node_11 = child(div_4);
                            slot(
                              node_11,
                              default_slot($$props),
                              {
                                get builder() {
                                  return get$1(builder);
                                }
                              }
                            );
                            template_effect(() => attributes_4 = set_attributes(div_4, attributes_4, { ...get$1(builder), ...$$restProps }));
                            action(div_4, ($$node) => get$1(builder).action($$node));
                            append($$anchor7, div_4);
                          },
                          null,
                          true
                        );
                        append($$anchor6, fragment_6);
                      },
                      true
                    );
                    append($$anchor5, fragment_5);
                  },
                  true
                );
                append($$anchor4, fragment_4);
              },
              true
            );
            append($$anchor3, fragment_3);
          },
          true
        );
        append($$anchor2, fragment_2);
      }
    );
    append($$anchor, fragment);
    pop();
  }
  function cubic_out(t) {
    const f = t - 1;
    return f * f * f + 1;
  }
  function slide(node, { delay = 0, duration = 400, easing = cubic_out, axis = "y" } = {}) {
    const style = getComputedStyle(node);
    const opacity = +style.opacity;
    const primary_property = axis === "y" ? "height" : "width";
    const primary_property_value = parseFloat(style[primary_property]);
    const secondary_properties = axis === "y" ? ["top", "bottom"] : ["left", "right"];
    const capitalized_secondary_properties = secondary_properties.map(
      (e) => (
        /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
        `${e[0].toUpperCase()}${e.slice(1)}`
      )
    );
    const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
    const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
    const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
    const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
    const border_width_start_value = parseFloat(
      style[`border${capitalized_secondary_properties[0]}Width`]
    );
    const border_width_end_value = parseFloat(
      style[`border${capitalized_secondary_properties[1]}Width`]
    );
    return {
      delay,
      duration,
      easing,
      css: (t) => `overflow: hidden;opacity: ${Math.min(t * 20, 1) * opacity};${primary_property}: ${t * primary_property_value}px;padding-${secondary_properties[0]}: ${t * padding_start_value}px;padding-${secondary_properties[1]}: ${t * padding_end_value}px;margin-${secondary_properties[0]}: ${t * margin_start_value}px;margin-${secondary_properties[1]}: ${t * margin_end_value}px;border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;`
    };
  }
  var root_3 = /* @__PURE__ */ template(`<!> <!>`, 1);
  function Accordion_1($$anchor) {
    const items = [
      {
        title: "What is the meaning of life?",
        content: "To become a better person, to help others, and to leave the world a better place than you found it."
      },
      {
        title: "How do I become a better person?",
        content: "Read books, listen to podcasts, and surround yourself with people who inspire you."
      },
      {
        title: "What is the best way to help others?",
        content: "Give them your time, attention, and love."
      }
    ];
    Accordion($$anchor, {
      class: "w-full sm:max-w-[70%]",
      multiple: true,
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        each(node, 1, () => items, index, ($$anchor3, item, i) => {
          Accordion_item($$anchor3, {
            value: `$${i ?? ""}`,
            class: "group border-b border-dark-10 px-1.5",
            children: ($$anchor4, $$slotProps2) => {
              var fragment_3 = root_3();
              var node_1 = first_child(fragment_3);
              Accordion_header(node_1, {
                children: ($$anchor5, $$slotProps3) => {
                  Accordion_trigger($$anchor5, {
                    class: "flex w-full flex-1 items-center justify-between py-5 text-[15px] font-medium transition-all [&[data-state=open]>span>svg]:rotate-180 ",
                    children: ($$anchor6, $$slotProps4) => {
                      var text$1 = text();
                      template_effect(() => set_text(text$1, get$1(item).title));
                      append($$anchor6, text$1);
                    },
                    $$slots: { default: true }
                  });
                },
                $$slots: { default: true }
              });
              var node_2 = sibling(node_1, 2);
              Accordion_content(node_2, {
                transition: slide,
                transitionConfig: { duration: 200 },
                class: "pb-[25px] text-sm tracking-[-0.01em]",
                children: ($$anchor5, $$slotProps3) => {
                  var text_1 = text();
                  template_effect(() => set_text(text_1, get$1(item).content));
                  append($$anchor5, text_1);
                },
                $$slots: { default: true }
              });
              append($$anchor4, fragment_3);
            },
            $$slots: { default: true }
          });
        });
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    });
  }
  const proto = Object.getPrototypeOf(document.createElement("div"));
  console.log(proto);
  console.log(proto.constructor);
  console.log(proto.constructor.name);
  mount(Accordion_1, { target: document.body });
})();
//# sourceMappingURL=content.js.map
