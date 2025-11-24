package com.cona.modules.auth.service;

import java.util.HashMap;
import java.util.Map;

public class Singleton {

    private static Singleton instancia_unica;
    private Map<String, Boolean> sesionesActivas = new HashMap<>();

    private Singleton() {
    }

    public static Singleton getInstancia_unica() {
        if (instancia_unica == null) {
            instancia_unica = new Singleton();
        }
        return instancia_unica;
    }

    public boolean yaSeUso(String email) {
        return sesionesActivas.getOrDefault(email, false);
    }

    public void marcado(String email) {
        sesionesActivas.put(email, true);
    }

    public void reset(String email) {
        sesionesActivas.put(email, false);
    }

}
