# React Native core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**

# Mapbox
-keep class com.mapbox.** { *; }
-keep class com.rnmapbox.rnmbx.** { *; }
-dontwarn com.mapbox.**
-dontwarn com.rnmapbox.**

# Reanimated / Worklets
-keep class com.swmansion.reanimated.** { *; }
-keep class com.worklets.** { *; }
-dontwarn com.swmansion.reanimated.**
-dontwarn com.worklets.**

# Gesture Handler / Safe Area / SVG
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }
-keep class com.horcrux.svg.** { *; }
-dontwarn com.swmansion.**
-dontwarn com.th3rdwave.**
-dontwarn com.horcrux.**

# Community libraries
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keep class com.reactnativecommunity.netinfo.** { *; }
-keep class com.mkuczera.** { *; }
-dontwarn com.reactnativecommunity.**
-dontwarn com.mkuczera.**

# Kotlin
-keep class kotlin.** { *; }
-dontwarn kotlin.**

# keep line numbers in crash stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
-keepattributes *Annotation*

-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
