package com.encryption.comparison.service;

import com.encryption.comparison.model.SecurityEstimation;
import org.springframework.stereotype.Service;

@Service
public class SecurityEstimatorService {

    public SecurityEstimation estimateBreakTime(String algorithm, int keySize) {
        SecurityEstimation estimate = new SecurityEstimation();
        estimate.setAlgorithm(algorithm);
        estimate.setKeySize(keySize);

        if ("RSA".equals(algorithm)) {
            switch (keySize) {
                case 1024:
                    estimate.setSecurityBits(80);
                    estimate.setEstimatedBreakTime("Days to weeks on specialized hardware");
                    break;
                case 2048:
                    estimate.setSecurityBits(112);
                    estimate.setEstimatedBreakTime("Years with current technology");
                    break;
                case 3072:
                    estimate.setSecurityBits(128);
                    estimate.setEstimatedBreakTime("Decades with current technology");
                    break;
                case 4096:
                    estimate.setSecurityBits(152);
                    estimate.setEstimatedBreakTime("Beyond foreseeable future");
                    break;
            }
        } else if ("ECC".equals(algorithm)) {
            switch (keySize) {
                case 256:
                    estimate.setSecurityBits(128);
                    estimate.setEstimatedBreakTime("Decades with current technology");
                    break;
                case 384:
                    estimate.setSecurityBits(192);
                    estimate.setEstimatedBreakTime("Beyond foreseeable future");
                    break;
                case 521:
                    estimate.setSecurityBits(256);
                    estimate.setEstimatedBreakTime("Beyond foreseeable quantum computing threats");
                    break;
            }
        }

        return estimate;
    }
}